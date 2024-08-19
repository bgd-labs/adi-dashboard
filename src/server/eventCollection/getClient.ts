import { createPublicClient, http } from "viem";
import * as chains from "viem/chains";

import { getCrossChainControllers } from "./getCrossChainControllers";

export const getClient = async ({
  chainId,
}: {
  chainId: number;
  disableFallback?: boolean;
}) => {
  const chain = Object.values(chains).find((chain) => chain.id === chainId);
  const crossChainControllers = await getCrossChainControllers();
  const crossChainController = crossChainControllers.find(
    (controller) => controller.chain_id === chainId,
  );

  if (!chain || !crossChainController) {
    throw new Error(`Chain or CCC config for chain id ${chainId} not found`);
  }

  const { rpc_urls: rpcUrls } = crossChainController;

  if (!rpcUrls?.length) {
    throw new Error(`No RPC urls found for chain id ${chainId}`);
  }

  const rpcUrl = rpcUrls[0];

  const client = createPublicClient({
    batch: {
      multicall: true,
    },
    chain: chain,
    transport: http(rpcUrl),
  });

  return { client, crossChainController };
};
