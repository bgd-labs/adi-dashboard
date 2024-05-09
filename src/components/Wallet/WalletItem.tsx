import { WalletType } from "@bgd-labs/frontend-web3-utils";
import Image from "next/image";

import { Button } from "@/components/Button";
import { useStore } from "@/providers/ZustandStoreProvider";

export type Wallet = {
  walletType: WalletType;
  icon: string;
  title: string;
  onClick?: () => void;
  isVisible?: boolean;
  setOpenImpersonatedForm?: (value: boolean) => void;
};

export const WalletItem = ({
  walletType,
  title,
  icon,
  onClick,
  setOpenImpersonatedForm,
}: Wallet) => {
  const connectWallet = useStore((state) => state.connectWallet);

  const handleWalletClick = async () => {
    if (walletType === WalletType.Impersonated && setOpenImpersonatedForm) {
      setOpenImpersonatedForm(true);
    } else {
      await connectWallet(walletType);
    }
  };

  return (
    <Button
      className="py-2 text-left"
      onClick={!!onClick ? onClick : handleWalletClick}
    >
      <span>{title}</span>
      {walletType === WalletType.Injected ? (
        <div
          className="ml-auto h-6 w-6"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      ) : (
        <Image
          className="ml-auto h-6 w-6"
          src={icon}
          alt={walletType}
          unoptimized
        />
      )}
    </Button>
  );
};
