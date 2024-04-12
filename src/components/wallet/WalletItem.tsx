import { WalletType } from "@bgd-labs/frontend-web3-utils";

import { useStore } from "@/providers/ZustandStoreProvider";
import { Button } from "@/components/Button";
import Image from "next/image";

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
    <Button className="text-left py-2" onClick={!!onClick ? onClick : handleWalletClick}>
      <span>{title}</span>
      {walletType === WalletType.Injected ? (
        <div className="w-6 h-6 ml-auto" dangerouslySetInnerHTML={{ __html: icon }} />
      ) : (
        <Image className="w-6 h-6 ml-auto" src={icon} alt={walletType} unoptimized />
      )}
    </Button>
  );
};
