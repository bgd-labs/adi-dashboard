"use client";

import { StaticChainIcon as CI } from "@bgd-labs/react-web3-icons";
import { getChainName } from "@bgd-labs/react-web3-icons/dist/utils";

import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/utils/cn";

type Props = {
  chainId?: number | null;
  isBig?: boolean;
};

export const ChainIcon = ({ chainId, isBig }: Props) => {
  if (!chainId) return null;
  const chainName = getChainName({ chainId });

  return (
    <Tooltip value={chainName ?? "Unknown chain"}>
      <CI
        chainId={chainId}
        className={cn("h-5 w-5 shrink-0", { ["h-7 w-7"]: isBig })}
        loader={
          <div className={cn("h-5 w-5 shrink-0", { ["h-7 w-7"]: isBig })} />
        }
      />
    </Tooltip>
  );
};
