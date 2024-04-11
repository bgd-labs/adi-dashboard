"use client";

import {
  createWagmiConfig,
  WagmiZustandSync,
} from "@bgd-labs/frontend-web3-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useMemo } from "react";
import { mainnet } from "viem/chains";
import { WagmiProvider as BaseWagmiProvider, type Config } from "wagmi";

import { DESIRED_CHAIN_ID, useStore } from '@/providers/ZustandStoreProvider';
import { env } from '@/env';
import { CHAINS } from '@/constants/chains';

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
    // eslint-disable-next-line
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
    // eslint-disable-next-line
  }, []) as Config;

  return (
    <BaseWagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WagmiZustandSync
          withAutoConnect={false} // I think it can be true only for prod
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          wagmiConfig={config}
          defaultChainId={mainnet.id}
          store={{
            setWagmiConfig,
            setDefaultChainId,
            changeActiveWalletAccount,
          }}
        />
      </QueryClientProvider>
    </BaseWagmiProvider>
  );
};
