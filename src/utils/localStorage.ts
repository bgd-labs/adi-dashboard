import {
  LocalStorageKeys as Web3LocalStorageKeys,
  type WalletType,
} from "@bgd-labs/frontend-web3-utils";

import { type EnsDataItem } from "@/store/ensSlice";

export enum LocalStorageKeys {
  EnsAddresses = "EnsAddresses",
}

// for ENS
export const getLocalStorageEnsAddresses = () => {
  return localStorage?.getItem(LocalStorageKeys.EnsAddresses);
};

export const setLocalStorageEnsAddresses = (
  ensAddresses: Record<string, EnsDataItem>,
) => {
  localStorage?.setItem(
    LocalStorageKeys.EnsAddresses,
    JSON.stringify(ensAddresses),
  );
};

export const getLocalStorageLastConnectedWallet = () => {
  return localStorage?.getItem(Web3LocalStorageKeys.LastConnectedWallet) as
    | WalletType
    | undefined;
};
