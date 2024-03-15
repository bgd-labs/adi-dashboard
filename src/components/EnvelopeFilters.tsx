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
  SelectSeparator,
} from "./Select";
import { Input } from "./Input";

export const EnvelopeFilters = ({
  chains,
  from: fromInitial,
  to: toInitial,
}: {
  chains: RouterOutput["controllers"]["getChains"];
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
    <Box className="flex flex-col items-center justify-between sm:justify-center gap-3 bg-brand-300 px-3 py-3 md:flex-row md:gap-6 md:px-6">
      <div className="flex w-full gap-2">
        <Input placeholder="Proposal ID" className="lg:w-36 w-full grow" />
        <Input placeholder="Payload ID" className="lg:w-36 w-full grow" />
      </div>
      <div className="flex grow items-center gap-2 w-full md:w-auto">
        <Select onValueChange={handleFromValueChange} value={from}>
          <SelectTrigger className="bg-white md:w-[180px]">
            <SelectValue placeholder="From" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={"any"}>
              <div className="flex items-center gap-2">
                <span className="text-brand-500">Any chain</span>
              </div>
            </SelectItem>
            <SelectSeparator />
            {chains.map((chain) => (
              <SelectItem key={chain.chain_id} value={String(chain.chain_id)}>
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={chain.chain_id} />
                  <span className="text-sm font-semibold">
                    {chain.chain_name_alias}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <svg
          className="h-6 w-6 shrink-0 text-brand-500"
          fill="none"
          viewBox="0 0 24 24"
        >
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
          <SelectTrigger className="grow bg-white md:w-[180px]">
            <SelectValue placeholder="To" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={"any"}>
              <div className="flex items-center gap-2">
                <span className="text-brand-500">Any chain</span>
              </div>
            </SelectItem>
            <SelectSeparator />
            {chains.map((chain) => (
              <SelectItem key={chain.chain_id} value={String(chain.chain_id)}>
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={chain.chain_id} />
                  <span className="text-sm font-semibold">
                    {chain.chain_name_alias}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Box>
  );
};
