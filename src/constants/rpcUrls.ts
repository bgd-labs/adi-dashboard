// --------------------------------------------------
// RPC overrides for specific networks (public)
// --------------------------------------------------

import { mainnet } from "viem/chains";

export const RPC_URLS: Record<number, string[]> = {
  [mainnet.id]: [
    "https://eth.llamarpc.com",
    "https://eth-pokt.nodies.app",
    "https://eth.drpc.org",
  ],
  // TODO: Populate with reliable public RPC URLs
};
