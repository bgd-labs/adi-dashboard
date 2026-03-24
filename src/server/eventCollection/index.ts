import { eq } from "drizzle-orm";
import { type Hash } from "viem";

import { db } from "@/server/db";
import { crossChainControllers, retries } from "@/server/db/schema";

import { getClients } from "./getClients";
import { getCrossChainControllers } from "./getCrossChainControllers";
import { getEvents } from "./getEvents";
import { getEventsInSteps } from "./getEventsInSteps";

function getBlockOffset(chainId: number): bigint {
  switch (chainId) {
    case 137: // Polygon
      return 100n;
    default:
      return 8n;
  }
}

export const collectEvents = async () => {
  const crossChainControllersList = await getCrossChainControllers();
  const clients = await getClients({
    crossChainControllers: crossChainControllersList,
  });

  await Promise.all(
    crossChainControllersList.map(async (controller) => {
      const client = clients[controller.chain_id];

      if (!client) {
        throw new Error(`No client found for chain ${controller.chain_id}`);
      }

      const currentBlock = Number(
        (await client?.getBlockNumber()) - getBlockOffset(controller.chain_id),
      );

      console.log(
        `Scanning up to ${currentBlock} on ${client.chain?.name} (${getBlockOffset(controller.chain_id)} blocks offset)`,
      );

      const from = controller.last_scanned_block ?? controller.created_block;

      await getEventsInSteps({
        from,
        to: currentBlock,
        limit: controller.rpc_block_limit,
        callback: async (startBlock, endBlock) => {
          await getEvents({
            address: controller.address,
            from: startBlock,
            to: endBlock,
            client: client,
          });
        },
      });

      console.log("Done collecting events from chain ", client.chain?.name);
    }),
  );

  return true;
};

export const retryEvents = async () => {
  const crossChainControllersList = await getCrossChainControllers();
  const clients = await getClients({
    crossChainControllers: crossChainControllersList,
  });

  const retriesData = await db.select().from(retries);

  if (!retriesData.length) {
    console.log("No retries found");
    return true;
  }

  await Promise.all(
    retriesData.map(async (retry) => {
      const client = clients[retry.chain_id];

      if (!client) {
        throw new Error(`No client found for chain ${retry.chain_id}`);
      }

      const [data] = await db
        .select({ address: crossChainControllers.address })
        .from(crossChainControllers)
        .where(eq(crossChainControllers.chain_id, retry.chain_id))
        .limit(1);

      if (!data?.address) {
        throw new Error(`No controller found for chain ${retry.chain_id}`);
      }

      await getEvents({
        address: data.address as Hash,
        from: retry.from_block,
        to: retry.to_block,
        client: client,
        isRetry: true,
      });
    }),
  );

  console.log("Done retrying events");
  return true;
};
