import { WalletType } from "@bgd-labs/frontend-web3-utils";

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
    <button
      type="button"
      onClick={!!onClick ? onClick : handleWalletClick}
      className="mx-auto w-full max-w-[80%]"
    >
      <div className="mainBorder flex items-center justify-between px-3 py-2 transition-all hover:border-brand-900">
        <h3 className="mainText">{title}</h3>
        {walletType === WalletType.Injected ? (
          <div
            className={`h-[26px] w-[26px]`}
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        ) : (
          <div
            className={`h-[26px] w-[26px] bg-contain bg-center bg-no-repeat`}
            style={{ backgroundImage: `${icon}` }}
          />
        )}
      </div>
    </button>
  );
};
