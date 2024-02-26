"use client";

import { cn } from "@/utils/cn";
import { useState } from "react";
import { CopyIcon } from "@/components/CopyIcon";

type Props = {
  link?: string;
  value?: string | number | null;
  isShort?: boolean;
  isBig?: boolean;
};

export const CopyValueCard = ({ value, isShort, isBig }: Props) => {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const valueString = String(value);

  const handleCopyClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    await navigator.clipboard.writeText(valueString);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (isShort && valueString.length <= 16) return null;

  const [firstEight, lastEight] = [
    valueString.slice(0, 8),
    valueString.slice(-8),
  ];

  return (
    <button
      type="button"
      className={cn(
        "flex shrink items-center gap-1 border border-transparent opacity-60 transition-opacity duration-200 ease-in-out hover:opacity-100",
      )}
      onClick={handleCopyClick}
    >
      <div
        className={cn("flex font-mono leading-none", {
          ["text-xl"]: isBig,
        })}
      >
        {isShort && firstEight + "..." + lastEight}
        {!isShort && value}
      </div>
      <div
        className={cn("flex h-5 w-5 overflow-hidden", {
          ["h-6 w-6"]: isBig,
        })}
      >
        <CopyIcon isCopied={copied} />
      </div>
    </button>
  );
};
