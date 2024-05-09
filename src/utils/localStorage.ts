import {
  LocalStorageKeys as Web3LocalStorageKeys,
  type WalletType,
} from "@bgd-labs/frontend-web3-utils";

export const getLocalStorageLastConnectedWallet = () => {
  return localStorage?.getItem(Web3LocalStorageKeys.LastConnectedWallet) as
    | WalletType
    | undefined;
};
