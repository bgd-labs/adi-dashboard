"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { ChainIcon } from "@/components/ChainIcon";
import { env } from "@/env";
import { useDebounce } from "@/hooks/useDebounce";
import { type RouterOutput } from "@/server/api/types";

import { Box } from "./Box";
import { Input } from "./Input";
import { OptimalBandWidth } from "./OptimalBandwidth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

export const EnvelopeFilters = ({
  chains,
  from: fromInitial,
  to: toInitial,
  proposalId: proposalIdInitial,
  payloadId: payloadIdInitial,
}: {
  chains: RouterOutput["controllers"]["getChains"];
  from?: string;
  to?: string;
  proposalId?: string;
  payloadId?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState<string>(fromInitial ?? "any");
  const [to, setTo] = useState<string | undefined>(toInitial ?? "any");
  const [proposalId, setProposalId] = useState<string | undefined>(
    proposalIdInitial,
  );
  const [payloadId, setPayloadId] = useState<string | undefined>(
    payloadIdInitial,
  );

  const debouncedProposalId = useDebounce(proposalId, 300);
  const debouncedPayloadId = useDebounce(payloadId, 300);

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

  const handleProposalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProposalId(value);
  };

  const handlePayloadIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPayloadId(value);
  };

  useEffect(() => {
    if (debouncedProposalId === "") {
      router.push(pathname + "?" + createQueryString("proposalId", undefined));
      return;
    }

    router.push(
      pathname + "?" + createQueryString("proposalId", debouncedProposalId),
    );
  }, [debouncedProposalId, router, pathname, createQueryString]);

  useEffect(() => {
    if (debouncedPayloadId === "") {
      router.push(pathname + "?" + createQueryString("payloadId", undefined));
      return;
    }

    router.push(
      pathname + "?" + createQueryString("payloadId", debouncedPayloadId),
    );
  }, [debouncedPayloadId, router, pathname, createQueryString]);

  return (
    <Box className="flex flex-col items-center justify-between gap-3 bg-brand-300 px-3 py-3 sm:justify-center md:flex-row md:gap-6 md:px-6">
      <div className="flex w-full gap-2">
        <Input
          placeholder="Proposal ID"
          className="w-full grow lg:w-36"
          onChange={handleProposalIdChange}
          value={proposalId}
        />
        <Input
          placeholder="Payload ID"
          className="w-full grow lg:w-36"
          onChange={handlePayloadIdChange}
          value={payloadId}
        />
      </div>

      {from !== "any" &&
        from !== undefined &&
        to !== "any" &&
        to !== undefined && <OptimalBandWidth from={+from} to={+to} />}
      <div className="flex w-full grow items-center gap-2 md:w-auto">
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
