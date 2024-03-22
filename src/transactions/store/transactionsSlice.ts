"use client";

import {
  type BaseTx as BT,
  createTransactionsSlice as createBaseTransactionsSlice,
  type ITransactionsSlice,
  type IWalletSlice,
  type StoreSlice, type TransactionStatus, type WalletType,
} from '@bgd-labs/frontend-web3-utils';
import {type Address, type Hex} from 'viem';

export enum TxType {
  retryEnvelope = 'retryEnvelope',
  retryTransaction = 'retryTransaction',
}

type BaseTx = BT & {
  status?: TransactionStatus;
  pending: boolean;
  walletType: WalletType;
};

type RetryEnvelopeTx = BaseTx & {
  type: TxType.retryEnvelope;
  payload: {
    signer: Address; // need change
  };
};

type RetryTransactionTx = BaseTx & {
  type: TxType.retryTransaction;
  payload: {
    signer: Address; // need change
  };
};

export type TransactionUnion =
  | RetryEnvelopeTx
  | RetryTransactionTx

export type TransactionsSlice = ITransactionsSlice<TransactionUnion>;

export type TxWithStatus = TransactionUnion & {
  status?: TransactionStatus;
  pending: boolean;
  replacedTxHash?: Hex;
};

export type AllTransactions = TxWithStatus[];

export const createTransactionsSlice: StoreSlice<
  TransactionsSlice,
  IWalletSlice
> = (set, get) => ({
  ...createBaseTransactionsSlice<TransactionUnion>({
    txStatusChangedCallback: (data) => {
      switch (data.type) {
        case TxType.retryEnvelope:
          console.log(data.payload)
          break;
        case TxType.retryTransaction:
          console.log(data.payload)
          break;
      }
    },
    // not required, but can cause problem when tx pending and reload
    defaultClients: {},
  })(set, get),
});