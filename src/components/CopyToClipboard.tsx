"use client";

import { type ReactNode, useState } from "react";
import * as React from "react";

import { CopyIcon } from "@/components/CopyIcon";
import { cn } from "@/utils/cn";

type Props = {
  copyText: string | number | null;
  children?: ReactNode;
  className?: React.ComponentProps<"div">["className"];
};

export const CopyToClipboard = ({ copyText, className, children }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    await navigator.clipboard.writeText(String(copyText));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div className={cn("flex flex-wrap items-center", className)}>
      {children}
      <button className="ml-1" type="button" onClick={handleCopyClick}>
        <CopyIcon isCopied={copied} />
      </button>
    </div>
  );
};
