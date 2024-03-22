// TODO: maybe not need this

import { type Draft } from 'immer';
import { type Chain, createClient, fallback, http } from 'viem';
import {
  gnosis,
  mainnet,
} from 'viem/chains';

// chains RPC urls
export const initialRpcUrls: Record<number, string[]> = {
  [mainnet.id]: [
    'https://rpc.ankr.com/eth',
    'https://eth.nodeconnect.org',
  ],
};

export function setChain(chain: Chain, url?: string) {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: {
        ...chain.rpcUrls.default,
        http: [url ?? (initialRpcUrls[chain.id] ?? [])[0], ...(initialRpcUrls[chain.id] ?? [])],
      },
    },
    blockExplorers: {
      ...chain.blockExplorers,
      default:
        chain.id === gnosis.id
          ? { name: 'Gnosis chain explorer', url: 'https://gnosisscan.io' }
          : chain.blockExplorers?.default ?? mainnet.blockExplorers.default,
    },
  };
}

export const CHAINS: Record<number, Chain> = {
  [mainnet.id]: setChain(mainnet) as Draft<Chain>,
};

export const fallBackConfig = {
  rank: false,
  retryDelay: 30,
  retryCount: 3,
};

export const createViemClient = (
  chain: Chain,
  rpcUrl: string,
  withoutFallback?: boolean,
) =>
  createClient({
    batch: {
      multicall: true,
    },
    chain: setChain(chain, rpcUrl) as Draft<Chain>,
    transport: withoutFallback
      ? http(rpcUrl)
      : fallback(
          [http(rpcUrl), ...(initialRpcUrls[chain.id]?.map((url) => http(url)) ?? [])],
          fallBackConfig,
        ),
  });
