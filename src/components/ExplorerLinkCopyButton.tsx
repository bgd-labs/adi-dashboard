"use client";
import { useState } from "react";
import { CopyIcon } from "@/components/CopyIcon";

export const ExplorerLinkCopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <button
      className="flex h-7 w-9 shrink-0 items-center justify-center overflow-hidden opacity-60 transition-colors duration-100 ease-in-out hover:opacity-100"
      onClick={handleCopyClick}
    >
      <CopyIcon isCopied={copied} />
    </button>
  );
};
