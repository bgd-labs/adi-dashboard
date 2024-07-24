import { supabaseAdmin } from "@/server/api/supabase";

import { type CrossChainController } from "./types";

export const getCrossChainControllers = async (): Promise<
  CrossChainController[]
> => {
  const { data: chrossChainControllers } = await supabaseAdmin.from(
    "CrossChainControllers",
  ).select(`
    chain_id,
    address,
    created_block,
    last_scanned_block,
    rpc_urls,
    rpc_block_limit
  `);

  if (!chrossChainControllers) {
    throw new Error(
      "No CrossChainControllers found in configuration. Check your database.",
    );
  }

  return chrossChainControllers;
};
