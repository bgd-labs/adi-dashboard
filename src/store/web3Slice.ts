import {
  createWalletSlice,
  type IWalletSlice,
} from '@bgd-labs/frontend-web3-utils';

import { type TransactionsSlice } from '@/store/transactionsSlice';
import { ControllerRetryService } from '@/web3Services/controllerRetryService';
import { produce } from 'immer';
import { type StoreSliceWithClients } from '@/store';

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
  controllerRetryService: ControllerRetryService;
};

export const createWeb3Slice: StoreSliceWithClients<IWeb3Slice, TransactionsSlice> = (
  set,
  get,
  clients,
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
      get().controllerRetryService.connectSigner(config);
    }
    setTimeout(() => set({ walletConnectedTimeLock: false }), 1000);
  },

  controllerRetryService: new ControllerRetryService(clients),
});