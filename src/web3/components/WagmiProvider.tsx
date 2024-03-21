"use client";

import {
  createWagmiConfig,
  WagmiZustandSync,
} from "@bgd-labs/frontend-web3-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { WagmiProvider as WagmiBaseProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { env } from "@/env";

import { useStore } from "@/store";

const DESIRED_CHAIN_ID = 1;
const queryClient = new QueryClient();

export const WagmiProvider = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const { getImpersonatedAddress } = useStore();

  const config = useMemo(() => {
    return createWagmiConfig({
      // TODO: fetch chains from DB
      chains: [mainnet],
      connectorsInitProps: {
        appName: "a.DI",
        defaultChainId: DESIRED_CHAIN_ID,
        wcParams: {
          projectId: env.NEXT_PUBLIC_WC_PROJECT_ID,
          metadata: {
            name: "a.DI",
            description: "Aave Delivery Insfrastucture Monitoring Dashboard",
            url: "https://adi.onaave.com",
            icons: [""],
          },
        },
      },
      getImpersonatedAccount: getImpersonatedAddress,
    });
  }, []);

  return (
    <WagmiBaseProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WagmiZustandSync
          wagmiConfig={config}
          defaultChainId={DESIRED_CHAIN_ID}
          useStore={useStore}
        />
      </QueryClientProvider>
    </WagmiBaseProvider>
  );
}

export default WagmiProvider;