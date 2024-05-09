import {
  createWalletSlice,
  type IWalletSlice,
  type StoreSlice,
} from "@bgd-labs/frontend-web3-utils";
import { produce } from "immer";

import { type TransactionsSlice } from "@/store/transactionsSlice";
import { CrossChainControllerTXsService } from "@/web3Services/crossChainControllerTXsService";

/**
 * web3Slice is required only to have a better control over providers state i.e
 * change provider, trigger data refetch if provider changed and have globally available instances of rpcs and data providers
 */

export type IWeb3Slice = IWalletSlice & {
  wagmiProviderInitialize: boolean;
  setWagmiProviderInitialize: (value: boolean) => void;

  // need for connect wallet button to not show last tx status always after connected wallet (if we want to do tx loader on wallet connect button)
  walletConnectedTimeLock: boolean;
  connectSigner: () => void;

  // services
  crossChainControllerTXsService: CrossChainControllerTXsService;
};

export const createWeb3Slice: StoreSlice<IWeb3Slice, TransactionsSlice> = (
  set,
  get,
) => ({
  ...createWalletSlice({
    walletConnected: () => {
      get().connectSigner();
    },
  })(set, get),

  wagmiProviderInitialize: false,
  setWagmiProviderInitialize: (value) => {
    set((state) =>
      // !!! important, should be produce from immer, and we need to set value to zustand store when app initialize to work properly with wagmi
      produce(state, (draft) => {
        draft.wagmiProviderInitialize = value;
      }),
    );
  },

  walletConnectedTimeLock: false,
  connectSigner() {
    const config = get().wagmiConfig;
    set({ walletConnectedTimeLock: true });
    if (config) {
      get().crossChainControllerTXsService.connectSigner(config);
    }
    setTimeout(() => set({ walletConnectedTimeLock: false }), 1000);
  },

  crossChainControllerTXsService: new CrossChainControllerTXsService(),
});
