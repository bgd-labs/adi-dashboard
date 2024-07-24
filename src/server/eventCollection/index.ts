import { type Hash } from "viem";

import { supabaseAdmin } from "@/server/api/supabase";

import { getClients } from "./getClients";
import { getCrossChainControllers } from "./getCrossChainControllers";
import { getEvents } from "./getEvents";
import { getEventsInSteps } from "./getEventsInSteps";

export const collectEvents = async () => {
  const crossChainControllers = await getCrossChainControllers();
  const clients = await getClients({ crossChainControllers });

  await Promise.all(
    crossChainControllers.map(async (controller) => {
      const client = clients[controller.chain_id];

      if (!client) {
        throw new Error(`No client found for chain ${controller.chain_id}`);
      }

      const currentBlock = Number((await client?.getBlockNumber()) - 8n);

      console.log(`Current block on ${client.chain?.name} is ${currentBlock}`);

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
  const crossChainControllers = await getCrossChainControllers();
  const clients = await getClients({ crossChainControllers });

  const retries = await supabaseAdmin.from("Retries").select("*");

  if (!retries.data?.length) {
    console.log("No retries found");
    return true;
  }

  await Promise.all(
    retries.data.map(async (retry) => {
      const client = clients[retry.chain_id];

      if (!client) {
        throw new Error(`No client found for chain ${retry.chain_id}`);
      }

      const { data } = await supabaseAdmin
        .from("CrossChainControllers")
        .select("address")
        .eq("chain_id", retry.chain_id)
        .single();

      if (!data?.address) {
        throw new Error(`No controller found for chain ${retry.chain_id}`);
      }

      await getEvents({
        address: data?.address as Hash,
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
