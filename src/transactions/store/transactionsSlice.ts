"use client";

import {
  type BaseTx,
  createTransactionsSlice as createBaseTransactionsSlice,
  type ITransactionsSlice,
  type IWalletSlice,
  type StoreSlice,
} from '@bgd-labs/frontend-web3-utils';

export type TransactionUnion = BaseTx;

export type TransactionsSlice = ITransactionsSlice<TransactionUnion>;

export const createTransactionsSlice: StoreSlice<
  TransactionsSlice,
  IWalletSlice
> = (set, get) => ({
  ...createBaseTransactionsSlice<TransactionUnion>({
    txStatusChangedCallback: (data) => {
      console.log('txStatusChangedCallback', data);
    },
    defaultClients: {},
  })(set, get),
});
