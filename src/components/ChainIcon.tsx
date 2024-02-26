"use client";

import * as chains from "viem/chains";
import Image from "next/image";
import ethereumIcon from "@/assets/chains/ethereum.svg";
import polygonIcon from "@/assets/chains/polygon.svg";
import binanceIcon from "@/assets/chains/binance.svg";
import arbitrumIcon from "@/assets/chains/arbitrum.svg";
import avalancheIcon from "@/assets/chains/avalanche.svg";
import baseIcon from "@/assets/chains/base.svg";
import gnosisIcon from "@/assets/chains/gnosis.svg";
import metisIcon from "@/assets/chains/metis.svg";
import optimismIcon from "@/assets/chains/optimism.svg";
import unknownIcon from "@/assets/chains/unknown.svg";
import polygonZkEvmIcon from "@/assets/chains/polygonZkEvm.svg";
import scrollIcon from "@/assets/chains/scroll.svg";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/utils/cn";

type Props = {
  chainId?: number | null;
  isBig?: boolean;
};

const getIcon = (chainId: number) => {
  switch (chainId) {
    case 1:
      return ethereumIcon;
    case 10:
      return optimismIcon;
    case 1088:
      return metisIcon;
    case 1101:
      return polygonZkEvmIcon;
    case 56:
      return binanceIcon;
    case 8453:
      return baseIcon;
    case 137:
      return polygonIcon;
    case 100:
      return gnosisIcon;
    case 42161:
      return arbitrumIcon;
    case 43114:
      return avalancheIcon;
    case 534352:
      return scrollIcon;
    default:
      return unknownIcon;
  }
};

export const ChainIcon = ({ chainId, isBig }: Props) => {
  if (!chainId) return null;

  const chain = Object.values(chains).find((chain) => chain.id === chainId);

  return (
    <Tooltip value={chain?.name ?? "Unknown chain"}>
      <Image
        src={getIcon(chainId)}
        className={cn("h-5 w-5 shrink-0", { ["h-7 w-7"]: isBig })}
        alt={`Icon for ${chain?.name ?? "Unknown chain"}`}
        unoptimized
      />
    </Tooltip>
  );
};
