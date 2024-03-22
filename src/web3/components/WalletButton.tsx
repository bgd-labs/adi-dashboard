"use client";

import { type WalletType } from "@bgd-labs/frontend-web3-utils";
import { Button } from "@/components/Button";

import { useStore } from "@/store";
import { DESIRED_CHAIN_ID } from "@/web3/store/web3Slice";

export const WalletButton = ({ walletType }: { walletType: WalletType }) => {
  const connectWallet = useStore((store) => store.connectWallet);

  const handleWalletClick = async () => {
    await connectWallet(walletType, DESIRED_CHAIN_ID);
  };

  return (
    <Button onClick={handleWalletClick}>
      Connect{" "}{walletType}
    </Button>
  );
};
