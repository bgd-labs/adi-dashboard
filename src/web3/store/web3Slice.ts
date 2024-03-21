import {
  createWalletSlice,
  type IWalletSlice,
  type StoreSlice,
} from '@bgd-labs/frontend-web3-utils';

import { type TransactionsSlice } from '@/transactions/store/transactionsSlice';
export type IWeb3Slice = IWalletSlice;

export const createWeb3Slice: StoreSlice<IWeb3Slice, TransactionsSlice> = (
  set,
  get,
) => ({
  ...createWalletSlice({
    walletConnected: () => {
      console.log('Wallet Connected')
    },
  })(set, get),
});
