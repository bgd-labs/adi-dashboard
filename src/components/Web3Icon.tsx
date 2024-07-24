"use client";

import { Web3DynamicIcon } from "@bgd-labs/react-web3-icons";
import {
  type AssetIconProps,
  type ChainType,
  type ComponentsFallback,
  getAssetIconNameAndPath,
  getChainIconNameAndPath,
  getWalletIconNameAndPath,
  type IconInfo,
  type WalletType,
  Web3IconType,
} from "@bgd-labs/react-web3-icons/dist/utils";
import { type ComponentProps } from "react";

import { cn } from "@/utils/cn";

const sizes: Record<number | string, string> = {
  [5]: `h-5 w-5`,
  [7]: `h-7 w-7`,
  default: `h-5 w-5`,
};

interface Web3IconProps {
  iconInfo:
    | IconInfo<AssetIconProps>
    | IconInfo<Pick<ChainType, "chainId" | "variant">>
    | IconInfo<Pick<WalletType, "walletName" | "variant">>;
  className?: ComponentProps<"div">["className"];
  size?: number;
}
/**
 * Renders an asset or chain or wallet icon specified by icon type and props.
 */
export const Web3Icon = ({ className, size, ...props }: Web3IconProps) => {
  let iconPath = undefined;
  let componentsFallback: ComponentsFallback | undefined = undefined;
  if (props.iconInfo.type === Web3IconType.asset) {
    const assetInfo = getAssetIconNameAndPath(
      props.iconInfo.info as AssetIconProps,
    );
    iconPath = assetInfo.iconPathToRepo;
    componentsFallback = {
      name: assetInfo.iconName,
      path: () =>
        import("@bgd-labs/react-web3-icons/dist/components/index.cjs"),
    };
  } else if (props.iconInfo.type === Web3IconType.chain) {
    const chainInfo = getChainIconNameAndPath(
      props.iconInfo.info as Pick<ChainType, "chainId" | "variant">,
    );
    iconPath = chainInfo.iconPathToRepo;
    componentsFallback = {
      name: chainInfo.iconName,
      path: () =>
        import("@bgd-labs/react-web3-icons/dist/components/chains/index.cjs"),
    };
  } else if (props.iconInfo.type === Web3IconType.wallet) {
    const walletInfo = getWalletIconNameAndPath(
      props.iconInfo.info as Pick<WalletType, "walletName" | "variant">,
    );
    iconPath = walletInfo.iconPathToRepo;
    componentsFallback = {
      name: walletInfo.iconName,
      path: () =>
        import("@bgd-labs/react-web3-icons/dist/components/wallets/index.cjs"),
    };
  }

  if (!iconPath || !componentsFallback) {
    return (
      <div
        className={cn(
          `${sizes[size ?? "default"]} animate-pulse rounded-full bg-brand-300`,
          className,
        )}
      />
    );
  }

  return (
    <Web3DynamicIcon
      className={cn(`${sizes[size ?? "5px"]}`, className)}
      src={iconPath}
      componentsFallback={componentsFallback}
      loader={
        <div
          className={cn(
            `${sizes[size ?? "24"]} animate-pulse rounded-full bg-brand-300`,
            className,
          )}
        />
      }
    />
  );
};
