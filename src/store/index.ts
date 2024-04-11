import { type ClientsRecord } from '@bgd-labs/frontend-web3-utils';
import  {type StoreApi } from 'zustand';
import { createWeb3Slice, type IWeb3Slice } from '@/store/web3Slice';
import { createTransactionsSlice, type TransactionsSlice } from '@/store/transactionsSlice';
import { createEnsSlice, type IEnsSlice } from '@/store/ensSlice';


export type StoreSliceWithClients<T extends object, E extends object = T> = (
  set: StoreApi<E extends T ? E : E & T>["setState"],
  get: StoreApi<E extends T ? E : E & T>["getState"],
  clients: ClientsRecord,
) => T;

export type RootState = IWeb3Slice & IEnsSlice & TransactionsSlice;

// combine zustand slices to one root slice
export const createRootSlice = (
  set: StoreApi<RootState>["setState"],
  get: StoreApi<RootState>["getState"],
  clients: ClientsRecord,
) => ({
  ...createWeb3Slice(set, get, clients),
  ...createTransactionsSlice(set, get, clients),
  ...createEnsSlice(set, get, clients),
});