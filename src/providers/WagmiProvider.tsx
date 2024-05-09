"use client";

import {
  createWagmiConfig,
  WagmiZustandSync,
} from "@bgd-labs/frontend-web3-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { mainnet } from "viem/chains";

import { CHAINS } from "@/constants/chains";
import { env } from "@/env";
import { DESIRED_CHAIN_ID, useStore } from "@/providers/ZustandStoreProvider";

const queryClient = new QueryClient();

export const WagmiProvider = () => {
  const setWagmiConfig = useStore((store) => store.setWagmiConfig);
  const setDefaultChainId = useStore((store) => store.setDefaultChainId);
  const changeActiveWalletAccount = useStore(
    (store) => store.changeActiveWalletAccount,
  );

  const setWagmiProviderInitialize = useStore(
    (store) => store.setWagmiProviderInitialize,
  );
  useEffect(() => {
    setWagmiProviderInitialize(true);
  }, []);

  const config = useMemo(() => {
    return createWagmiConfig({
      chains: CHAINS,
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
      ssr: true,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiZustandSync
        withAutoConnect={false} // I think it can be true only for prod
        wagmiConfig={config}
        defaultChainId={mainnet.id}
        store={{
          setWagmiConfig,
          setDefaultChainId,
          changeActiveWalletAccount,
        }}
      />
    </QueryClientProvider>
  );
};
