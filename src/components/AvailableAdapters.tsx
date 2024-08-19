"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Box } from "@/components/Box";
import { ChainIcon } from "@/components/ChainIcon";
import { OptimalBandWidth } from "@/components/OptimalBandwidth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { type RouterOutput } from "@/server/api/types";

export const AvailableAdapters = ({
  chains,
}: {
  chains: RouterOutput["controllers"]["getChains"];
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fromInitial = searchParams.get("from");
  const toInitial = searchParams.get("to");

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
    <>
      <Box className="flex flex-col justify-between gap-3 bg-brand-300 px-3 py-3 sm:justify-center md:flex-row md:items-center md:gap-6 md:px-6">
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
            {chains &&
              chains.map((chain) => (
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
          className="h-6 w-6 shrink-0 rotate-90 text-brand-500 md:rotate-0"
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
            {chains &&
              chains.map((chain) => (
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
        <span className="md:ml-auto">
          <OptimalBandWidth from={Number(from)} to={Number(to)} />
        </span>
      </Box>
    </>
  );
};
