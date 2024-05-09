"use client";

import {
  getBrowserWalletLabelAndIcon,
  WalletType,
} from "@bgd-labs/frontend-web3-utils";
import React, { useEffect, useState } from "react";

import coinbase from "@/assets/wallets/coinbase.svg";
import gnosisSafe from "@/assets/wallets/gnosisSafe.svg";
import walletConnect from "@/assets/wallets/walletConnect.svg";
import impersonated from "@/assets/wallets/impersonated.svg";
import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { WalletActive } from "@/components/Wallet/WalletActive";
import { type Wallet, WalletItem } from "@/components/Wallet/WalletItem";
import { useStore } from "@/providers/ZustandStoreProvider";
import { getLocalStorageLastConnectedWallet } from "@/utils/localStorage";
import { ImpersonatedForm } from "@/components/Wallet/ImpersonatedForm";

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
    icon: coinbase,
    title: "Coinbase",
    isVisible: true,
  },
  {
    walletType: WalletType.WalletConnect,
    icon: walletConnect,
    title: "WalletConnect",
    isVisible: true,
  },
  {
    walletType: WalletType.Safe,
    icon: gnosisSafe,
    title: "Safe Wallet",
    isVisible: typeof window !== "undefined" && window !== window.parent,
  },
  {
    walletType: WalletType.Impersonated,
    icon: impersonated,
    title: "Impersonated",
    isVisible: true,
  },
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

  const [impersonatedFormOpen, setImpersonatedFormOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!lastConnectedWallet || !activeWallet?.isActive) {
      setLoading(false);
    }
  }, [lastConnectedWallet]);

  if (loading) {
    return (
      <Button loading className="text-sm">
        Loading...
      </Button>
    );
  }

  if (activeWallet) {
    return <WalletActive />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button loading={walletActivating} className="text-sm">
          Connect wallet
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-6 text-center">Connect wallet</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {walletActivating ? (
            <div className="appBackground flex flex-col items-center justify-center">
              {/* Here can be some animated loader */}
              <h2 className="mb-3 text-lg">Connecting...</h2>
              <h3>Waiting confirmation from your wallet</h3>
            </div>
          ) : (
            <>
              {impersonatedFormOpen && !!setImpersonatedFormOpen ? (
                <ImpersonatedForm />
              ) : (
                <>
                  {wallets.map((wallet) => (
                    <React.Fragment key={wallet.walletType}>
                      {wallet.isVisible && (
                        <WalletItem
                          walletType={wallet.walletType}
                          icon={wallet.icon}
                          title={wallet.title}
                          setOpenImpersonatedForm={setImpersonatedFormOpen}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {walletConnectionError && (
          <div className="my-4 text-center text-xs text-red-500">
            {walletConnectionError}
          </div>
        )}

        <DialogDescription className="mt-6 text-center text-xs text-brand-900/30">
          By&nbsp;selecting a&nbsp;wallet from an&nbsp;External Provider, you
          agree to&nbsp;their Terms and Conditions. Your ability to&nbsp;access
          the wallet may depend on the External Provider being operational.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
