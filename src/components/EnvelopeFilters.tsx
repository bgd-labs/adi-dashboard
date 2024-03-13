"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Box } from "./Box";
import { ChainIcon } from "./ChainIcon";
import { type RouterOutput } from "@/server/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export const EnvelopeFilters = ({
  chains,
  from: fromInitial,
  to: toInitial,
}: {
  chains: RouterOutput['controllers']['getChains'];
  from?: string;
  to?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState<string>(fromInitial ?? "any");
  const [to, setTo] = useState<string | undefined>(toInitial ?? "any");

  const createQueryString = useCallback(
    (name: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined) {
        params.delete(name);
        return params.toString();
      }

      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleFromValueChange = (value: string | null) => {
    setFrom(value ?? "any");

    if (value === "any" || value === null) {
      router.push(pathname + "?" + createQueryString("from", undefined));
      return;
    }

    router.push(pathname + "?" + createQueryString("from", value));
  };

  const handleToValueChange = (value: string | null) => {
    setTo(value ?? "any");

    if (value === "any" || value === null) {
      router.push(pathname + "?" + createQueryString("to", undefined));
      return;
    }

    router.push(pathname + "?" + createQueryString("to", value));
  };

  return (
    <Box className="flex items-center gap-2 bg-brand-100 px-6 py-4">
      <Select onValueChange={handleFromValueChange} value={from}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="From" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value={"any"}>
            <div className="flex items-center gap-2">
              <span className="text-brand-500">Any chain</span>
            </div>
          </SelectItem>
          {chains.map((chain) => (
            <SelectItem key={chain.chain_id} value={String(chain.chain_id)}>
              <div className="flex items-center gap-2">
                <ChainIcon chainId={chain.chain_id} />
                <span>{chain.chain_name_alias}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13.75 6.75L19.25 12L13.75 17.25"
        ></path>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 12H4.75"
        ></path>
      </svg>
      <Select onValueChange={handleToValueChange} value={to}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="To" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value={"any"}>
            <div className="flex items-center gap-2">
              <span className="text-brand-500">Any chain</span>
            </div>
          </SelectItem>
          {chains.map((chain) => (
            <SelectItem key={chain.chain_id} value={String(chain.chain_id)}>
              <div className="flex items-center gap-2">
                <ChainIcon chainId={chain.chain_id} />
                <span>{chain.chain_name_alias}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Box>
  );
};
