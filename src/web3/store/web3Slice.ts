import {
  createWalletSlice,
  type IWalletSlice,
  type StoreSlice,
} from '@bgd-labs/frontend-web3-utils';

import { type TransactionsSlice } from '@/transactions/store/transactionsSlice';
import {ControllerRetryService} from '@/web3/services/controllerRetryService';
import {createViemClient} from '@/utils/chains';
import {mainnet} from 'viem/chains';
import {zeroAddress} from 'viem';

export const DESIRED_CHAIN_ID = 1;

/**
 * web3Slice is required only to have a better control over providers state i.e
 * change provider, trigger data refetch if provider changed and have globally available instances of rpcs and data providers
 */

export type IWeb3Slice = IWalletSlice & {
  // need for connect wallet button to not show last tx status always after connected wallet (if we want to do tx loader on wallet connect button)
  walletConnectedTimeLock: boolean;

  controllerRetryService: ControllerRetryService;

  connectSigner: () => void;
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
  controllerRetryService: new ControllerRetryService(createViemClient(mainnet, mainnet.rpcUrls.default.http[0]), zeroAddress), // TODO: need change

  walletConnectedTimeLock: false,
  connectSigner() {
    const config = get().wagmiConfig;
    set({ walletConnectedTimeLock: true });
    if (config) {
      get().controllerRetryService.connectSigner(config);
    }
    setTimeout(() => set({ walletConnectedTimeLock: false }), 1000);
  },
});