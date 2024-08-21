import Link from "next/link";

import { Box } from "@/components/Box";
import { ChainIcon } from "@/components/ChainIcon";
import { ExplorerLink } from "@/components/ExplorerLink";
import { Tooltip } from "@/components/Tooltip";
import { type RouterOutput } from "@/server/api/types";
import { type RangeStatus } from "@/server/eventCollection/types";
import { cn } from "@/utils/cn";

type ChartProps = {
  ranges: RangeStatus[];
  title?: string;
  chainId: number;
  lastScannedBlock?: number;
  balance?: {
    native: string;
    link: string;
  };
  address: string;
  burnRate?: {
    native: string;
    link: string;
  } | null;
  bridgingStats?: RouterOutput["controllers"]["getBridgingStats"];
};

export const ScanChart = ({
  ranges,
  title,
  chainId,
  lastScannedBlock,
  balance,
  address,
  burnRate,
  bridgingStats,
}: ChartProps) => {
  const totalRange = ranges.reduce(
    (total, { range }) => total + (range[1] - range[0]),
    0,
  );

  const scannedRange = ranges
    .filter(({ status }) => status === "scanned")
    .reduce((total, { range }) => total + (range[1] - range[0]), 0);

  const percentage = parseFloat(((scannedRange / totalRange) * 100).toFixed(2));
  const showBalances = balance?.native ?? balance?.link;

  return (
    <Box>
      <div className="bg-brand-100 px-6 pb-9 pt-5">
        <div className="mb-4 flex flex-col flex-wrap gap-2 sm:gap-2 md:flex-row md:items-center">
          <div className="flex gap-2 md:mr-auto">
            <ChainIcon chainId={chainId} />
            <div className="color-brand-900 text-sm font-semibold">
              {title}
              <span className="ml-1 text-xs font-normal opacity-40">
                (~{percentage}% scanned)
              </span>
            </div>
          </div>
          <ExplorerLink
            chainId={chainId}
            value={address}
            type="address"
            hideLabel
          />
        </div>
        {showBalances && (
          <div className="mb-3 grid w-fit gap-5 border border-brand-300 bg-white p-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider">
                Balances
              </h2>
              {balance?.native && (
                <div className="w-fit rounded border border-brand-300 bg-brand-300 px-1.5 py-0.5 font-mono text-xs">
                  {balance?.native}
                </div>
              )}
              {balance?.link && (
                <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs">
                  {balance?.link}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider">
                Two week burn rate
              </h2>
              {burnRate?.native && (
                <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs uppercase">
                  {burnRate?.native}
                </div>
              )}
              {burnRate?.link && (
                <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs uppercase">
                  {burnRate?.link}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider">
                Two week stats
              </h2>
              <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs uppercase">
                {bridgingStats?.numberOfBridgingEvents} bridging events
              </div>
              <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs uppercase">
                {bridgingStats?.numberOfEnvelopes} envelopes
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider">
                Two week avg gas price
              </h2>
              <div className="w-fit rounded bg-brand-300 px-1.5 py-0.5 font-mono text-xs uppercase">
                {bridgingStats?.averageGasPrice}
              </div>
            </div>
            <div className="sm:col-span-1 md:col-span-2">
              <div>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider">
                  Two week adapter usage:
                </h2>
                <div className="grid rounded-md border">
                  {bridgingStats?.usageStats.map(
                    ({ chainId: destinationChainId, adapters }) => (
                      <div
                        key={destinationChainId + "-used"}
                        className="flex items-center justify-start gap-5 border-b py-3 px-2 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
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
                          <ChainIcon chainId={destinationChainId} />
                        </div>
                        <div className="grid gap-1">
                          {adapters.map(({ address, count }) => (
                            <div
                              className="flex items-center gap-2"
                              key={address + destinationChainId}
                            >
                              <div className="w-7 rounded bg-brand-300 px-1.5 py-0.5 text-center font-mono text-xs uppercase">
                                {count}
                              </div>
                              <ExplorerLink
                                type="address"
                                value={address}
                                chainId={chainId}
                                skipAdapter
                                tiny
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-1 md:col-span-2">
              <div>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider">
                  Available adapters:
                </h2>
                <Link href={`/adapters?from=${chainId}`}>
                  <div className="flex items-center gap-2 text-sm text-brand-900 underline">
                    Check available adapters
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="w-full grow">
          <div className="flex h-2">
            {ranges.map(({ range, status }) => {
              const width = ((range[1] - range[0]) / totalRange) * 100;

              return (
                <div
                  key={status + range[0] + range[1]}
                  className={cn("h-1", {
                    "bg-green-400": status === "scanned",
                    "bg-red-500": status === "failed",
                    "bg-brand-300": status === "pending",
                  })}
                  style={{ width: `${width}%`, minWidth: "1px" }}
                />
              );
            })}
          </div>
          <div className="flex h-2 justify-between pt-2">
            <Tooltip value="Deployment block">
              <div className="font-mono text-xs text-brand-900 opacity-60">
                {ranges[0]?.range[0]}
              </div>
            </Tooltip>
            <Tooltip value="Last scanned block">
              <div className="ml-auto mr-3 font-mono text-xs text-green-500">
                {lastScannedBlock}
              </div>
            </Tooltip>
            <Tooltip value="Latest block">
              <div className="font-mono text-xs text-brand-900 opacity-60">
                {ranges[ranges.length - 1]?.range[1]}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </Box>
  );
};
