"use client";

import {
  type BaseTx as BT,
  createTransactionsSlice as createBaseTransactionsSlice,
  type ITransactionsSlice,
  type IWalletSlice, type TransactionStatus, type WalletType,
} from '@bgd-labs/frontend-web3-utils';
import { type Hex } from 'viem';
import { type StoreSliceWithClients } from '@/store';
import {
  type RetryEnvelopeTxParams,
  type RetryTransactionTxParams,
} from '@/web3Services/controllerRetryService';

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
  payload: RetryEnvelopeTxParams;
};

type RetryTransactionTx = BaseTx & {
  type: TxType.retryTransaction;
  payload: RetryTransactionTxParams;
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

export const createTransactionsSlice: StoreSliceWithClients<
  TransactionsSlice,
  IWalletSlice
> = (set, get, clients) => ({
  ...createBaseTransactionsSlice<TransactionUnion>({
    txStatusChangedCallback: async (data) => {
      switch (data.type) {
        case TxType.retryEnvelope:
          console.log(data.payload)
          break;
        case TxType.retryTransaction:
          console.log(data.payload)
          break;
      }
    },
    defaultClients: clients,
  })(set, get),
});