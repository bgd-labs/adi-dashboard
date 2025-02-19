import {
  type Chain,
  createPublicClient,
  fallback,
  http,
  type PublicClient,
  type Transport,
} from "viem";
import * as chains from "viem/chains";

import { type CrossChainController } from "./types";

type getClientsProps = {
  crossChainControllers: CrossChainController[];
};

export const getClients = async ({
  crossChainControllers,
}: getClientsProps) => {
  const usedChainIds = crossChainControllers.map((chain) => chain.chain_id);
  const chainRpcUrls = crossChainControllers.reduce(
    (acc: Record<number, string[] | null>, chain) => {
      acc[chain.chain_id] = chain.rpc_urls;
      return acc;
    },
    {} as Record<number, string[] | null>,
  );

  const chainsToUse = Object.values(chains).filter((chain) =>
    usedChainIds.includes(chain.id),
  );

  const uniqueChainIds = new Set(usedChainIds);
  const supportedChainIds = new Set(chainsToUse.map((chain) => chain.id));

  if (supportedChainIds.size !== uniqueChainIds.size) {
    throw new Error(
      "Couldn't create clients, some chains are not supported by VIEM.",
    );
  }

  const chainsWithUpdatedRpcUrls = chainsToUse.map((chain: Chain) => {
    const rpcUrls = {
      ...chain.rpcUrls,
      default: {
        http: [
          crossChainControllers.find(
            (usedChain) => usedChain.chain_id === chain.id,
          )?.rpc_urls?.[0] ?? chain.rpcUrls.default.http[0]!,
        ],
      },
    };

    const chainsWithUrls = {
      ...chain,
      rpcUrls,
    };

    return chainsWithUrls;
  });

  const clients: Record<number, PublicClient<Transport, Chain>> = {};

  chainsWithUpdatedRpcUrls.forEach((chain) => {
    const client = createPublicClient({
      batch: {
        multicall: true,
      },
      chain: chain,
      transport: fallback(
        chainRpcUrls[chain.id]?.map((url) => http(url)) ?? [],
      ),
    });

    clients[chain.id] = client;
  });

  return clients;
};
