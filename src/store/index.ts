"use client";

import { create, type StoreApi } from "zustand";
import { devtools } from "zustand/middleware";

import {
  createTransactionsSlice,
  type TransactionsSlice,
} from "@/transactions/store/transactionsSlice";
import { createWeb3Slice, type IWeb3Slice } from "@/web3/store/web3Slice";

type RootState = IWeb3Slice & TransactionsSlice;

const createRootSlice = (
  set: StoreApi<RootState>["setState"],
  get: StoreApi<RootState>["getState"],
) => ({
  ...createWeb3Slice(set, get),
  ...createTransactionsSlice(set, get),
});

export const useStore = create(devtools(createRootSlice, { serialize: true }));
