import {
  IconVariant,
  Web3IconType,
} from "@bgd-labs/react-web3-icons/dist/utils/index";
import React from "react";
import { mainnet } from "viem/chains";

import { Web3Icon } from "@/components/Web3Icon";
import { cn } from "@/utils/cn";

type Props = {
  from: number | null;
  to: number | null;
  isBig?: boolean;
};

export const FromTo = ({ from, to, isBig }: Props) => {
  return (
    <div className="flex items-center gap-1 text-brand-500">
      <Web3Icon
        size={isBig ? 7 : 5}
        iconInfo={{
          type: Web3IconType.chain,
          info: {
            chainId: from ?? mainnet.id,
            variant: IconVariant.Full,
          },
        }}
      />
      <svg
        className={cn("h-6 w-6", { ["h-7 w-7"]: isBig })}
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13.75 6.75L19.25 12L13.75 17.25"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 12H4.75"
        />
      </svg>
      <Web3Icon
        size={isBig ? 7 : 5}
        iconInfo={{
          type: Web3IconType.chain,
          info: {
            chainId: to ?? mainnet.id,
            variant: IconVariant.Full,
          },
        }}
      />
    </div>
  );
};
