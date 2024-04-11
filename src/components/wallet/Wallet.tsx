"use client";

import {
  getBrowserWalletLabelAndIcon,
  WalletType,
} from "@bgd-labs/frontend-web3-utils";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { WalletActive } from "@/components/wallet/WalletActive";
import { type Wallet, WalletItem } from "@/components/wallet/WalletItem";
import { useStore } from "@/providers/ZustandStoreProvider";
import { getLocalStorageLastConnectedWallet } from "@/utils/localStorage";

const browserWalletLabelAndIcon = getBrowserWalletLabelAndIcon();

export const wallets: Wallet[] = [
  {
    walletType: WalletType.Injected,
    icon: browserWalletLabelAndIcon.icon,
    title: browserWalletLabelAndIcon.label,
    isVisible: true,
  },
  {
    walletType: WalletType.Coinbase,
    icon: `url("/wallets/coinbase.svg")`,
    title: "Coinbase",
    isVisible: true,
  },
  {
    walletType: WalletType.WalletConnect,
    icon: `url("/wallets/walletConnect.svg")`,
    title: "WalletConnect",
    isVisible: true,
  },
  {
    walletType: WalletType.Safe,
    icon: `url("/wallets/gnosisSafe.svg")`,
    title: "Safe wallet",
    isVisible: typeof window !== "undefined" && window !== window.parent,
  }
];

export const WalletWidget = () => {
  const lastConnectedWallet =
    typeof localStorage !== "undefined"
      ? getLocalStorageLastConnectedWallet()
      : undefined;

  const activeWallet = useStore((store) => store.activeWallet);
  const walletActivating = useStore((store) => store.walletActivating);
  const walletConnectionError = useStore(
    (store) => store.walletConnectionError,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!lastConnectedWallet || !activeWallet?.isActive) {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [lastConnectedWallet]);

  if (loading) {
    return (
      <div>
        <h1>TODO: button loading</h1>
      </div>
    );
  }

  if (activeWallet) {
    return <WalletActive />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={walletActivating}
          className="h-[28px] w-[120px] bg-brand-300 text-brand-900 transition-all hover:bg-brand-600 active:bg-brand-900 active:text-brand-100 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-brand-100 sm:h-[32px] sm:w-[140px]"
        >
          <p>{walletActivating ? "Connecting" : "Connect wallet"}</p>
          {walletActivating && <Spinner />}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">Connect wallet</DialogTitle>
        </DialogHeader>

        <div className="grid min-h-[190px] gap-3 pt-4">
          {walletActivating ? (
            <div className="appBackground flex flex-col items-center justify-center">
              {/* Here can be some animated loader */}
              <h2 className="mb-3 text-lg">Connecting...</h2>
              <h3>Waiting confirmation from your wallet</h3>
            </div>
          ) : (
            <>
              {wallets.map((wallet) => (
                <React.Fragment key={wallet.walletType}>
                  {wallet.isVisible && (
                    <WalletItem
                      walletType={wallet.walletType}
                      icon={wallet.icon}
                      title={wallet.title}
                    />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {walletConnectionError && (
          <div className="my-4 text-center text-xs text-red-500">
            {walletConnectionError}
          </div>
        )}

        <DialogDescription className="mt-6 text-center text-gray-400">
          By selecting a wallet from an External Provider, you agree to their
          Terms and Conditions. Your ability to access the wallet may depend on
          the External Provider being operational.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
