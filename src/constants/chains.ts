import { type Chain } from "viem";
import { gnosis, mainnet } from "viem/chains";

import { RPC_URLS } from "@/constants/rpcUrls";

export function setChain(chain: Chain, url?: string) {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: {
        ...chain.rpcUrls.default,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        http: [url ?? RPC_URLS[chain.id][0], ...RPC_URLS[chain.id]],
      },
    },
    blockExplorers: {
      ...chain.blockExplorers,
      default:
        chain.id === gnosis.id
          ? { name: "Gnosis chain explorer", url: "https://gnosisscan.io" }
          : chain.blockExplorers?.default ?? mainnet.blockExplorers.default,
    },
  };
}

// need for wallet connect and tx tracking
export const CHAINS: Record<number, Chain> = {
  [mainnet.id]: setChain(mainnet),
};
