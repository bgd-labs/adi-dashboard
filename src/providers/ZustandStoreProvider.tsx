"use client";

import {
  type ClientsRecord,
  initChainInformationConfig,
} from "@bgd-labs/frontend-web3-utils";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { mainnet } from 'viem/chains';
import { create, type StoreApi, useStore as useZustandStore } from "zustand";
import { devtools } from "zustand/middleware";

import { createRootSlice, type RootState } from "@/store";
import { CHAINS } from '@/constants/chains';

export const DESIRED_CHAIN_ID = mainnet.id;
const chainInfoHelpers = initChainInformationConfig(CHAINS);

// TODO: need think if it's possible to pass here clients from server
const clients: ClientsRecord = {};
Object.entries(chainInfoHelpers.clientInstances).forEach(
  (value) => (clients[Number(value[0])] = value[1].instance),
);

// provider with zustand store https://docs.pmnd.rs/zustand/guides/nextjs
export const ZustandStoreContext = createContext<StoreApi<RootState> | null>(
  null,
);

export interface ZustandStoreProviderProps {
  children: ReactNode;
}

export const ZustandStoreProvider = ({
  children,
}: ZustandStoreProviderProps) => {
  const storeRef = useRef<StoreApi<RootState>>();

  if (!storeRef.current) {
    storeRef.current = create(
      devtools(
        (setState, getState) => createRootSlice(setState, getState, clients),
        {
          serialize: true,
        },
      ),
    );
  }

  return (
    <ZustandStoreContext.Provider value={storeRef.current}>
      {children}
    </ZustandStoreContext.Provider>
  );
};

export const useStore = <T,>(selector: (store: RootState) => T): T => {
  const zustandStoreContext = useContext(ZustandStoreContext);

  if (!zustandStoreContext) {
    throw new Error(`useStore must be use within ZustandStoreProvider`);
  }

  return useZustandStore(zustandStoreContext, selector);
};
