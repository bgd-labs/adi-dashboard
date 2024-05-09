import { type StoreSlice } from "@bgd-labs/frontend-web3-utils";

import { type TransactionsSlice, TxType } from "@/store/transactionsSlice";
import { type IWeb3Slice } from "@/store/web3Slice";
import {
  type RetryEnvelopeTxParams,
  type RetryTransactionTxParams,
} from "@/web3Services/crossChainControllerTXsService";

export interface ICrossChainControllerTXsSlice {
  retryEnvelope: ({ ...params }: RetryEnvelopeTxParams) => Promise<void>;
  retryTransaction: ({ ...params }: RetryTransactionTxParams) => Promise<void>;
}

export const createCrossChainControllerTXsSlice: StoreSlice<
  ICrossChainControllerTXsSlice,
  IWeb3Slice & TransactionsSlice
> = (set, get) => ({
  retryEnvelope: async (params) => {
    await get().executeTx({
      body: () => get().crossChainControllerTXsService.retryEnvelope(params),
      params: {
        type: TxType.retryEnvelope,
        payload: params,
        desiredChainID: params.chainId,
      },
    });
  },
  retryTransaction: async (params) => {
    await get().executeTx({
      body: () => get().crossChainControllerTXsService.retryTransaction(params),
      params: {
        type: TxType.retryTransaction,
        payload: params,
        desiredChainID: params.chainId,
      },
    });
  },
});
