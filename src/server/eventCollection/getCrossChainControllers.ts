import { db } from "@/server/db";
import { crossChainControllers } from "@/server/db/schema";

import { type CrossChainController } from "./types";

export const getCrossChainControllers = async (): Promise<
  CrossChainController[]
> => {
  const data = await db
    .select({
      chain_id: crossChainControllers.chain_id,
      address: crossChainControllers.address,
      created_block: crossChainControllers.created_block,
      last_scanned_block: crossChainControllers.last_scanned_block,
      rpc_urls: crossChainControllers.rpc_urls,
      rpc_block_limit: crossChainControllers.rpc_block_limit,
    })
    .from(crossChainControllers);

  if (!data || data.length === 0) {
    throw new Error(
      "No CrossChainControllers found in configuration. Check your database - the table exists but is empty.",
    );
  }

  return data;
};
