"use client";
import { WalletType } from "@bgd-labs/frontend-web3-utils";
import { WalletButton } from "./WalletButton";
import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { useStore } from "@/store";

export const Wallet = () => {
  // const activeWallet = useStore((store) => store.activeWallet);
  // const disconnectActiveWallet = useStore(
  //   (store) => store.disconnectActiveWallet,
  // );
  // For me, getting data from a zustand like this looks more elegant and less cumbersome
  const { activeWallet, disconnectActiveWallet } = useStore();

  const handleDisconnect = async () => {
    await disconnectActiveWallet();
  };

  if (activeWallet) {
    const [firstEight, lastEight] = [
      activeWallet.address.slice(0, 8),
      activeWallet.address.slice(-8),
    ];
    return (
      <button
        onClick={handleDisconnect}
        className="group/wallet-button relative border px-2 py-1 font-mono text-sm"
      >
        <div className="absolute inset-0 flex hidden items-center justify-center bg-brand-900 group-hover/wallet-button:flex">
          Disconnect
        </div>
        {firstEight}...{lastEight}
      </button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-sm">Connect wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-4">
          <WalletButton walletType={WalletType.Injected} />
          <WalletButton walletType={WalletType.Coinbase} />
          <WalletButton walletType={WalletType.WalletConnect} />
          <WalletButton walletType={WalletType.WalletConnect} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
