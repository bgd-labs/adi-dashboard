import { ChainIcon } from "@/components/ChainIcon";
import { Box } from "@/components/Box";
import { ExplorerLink } from "@/components/ExplorerLink";
import { type RangeStatus } from "@/server/eventCollection/types";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/utils/cn";

type ChartProps = {
  ranges: RangeStatus[];
  title?: string;
  chainId: number;
  lastScannedBlock?: number;
  balance?: string;
  address: string;
};

export const ScanChart = ({
  ranges,
  title,
  chainId,
  lastScannedBlock,
  balance,
  address,
}: ChartProps) => {
  const totalRange = ranges.reduce(
    (total, { range }) => total + (range[1] - range[0]),
    0,
  );

  const scannedRange = ranges
    .filter(({ status }) => status === "scanned")
    .reduce((total, { range }) => total + (range[1] - range[0]), 0);

  const percentage = parseFloat(((scannedRange / totalRange) * 100).toFixed(2));

  return (
    <Box>
      <div className="px-6 pb-9 pt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="mr-auto flex gap-2">
            <ChainIcon chainId={chainId} />
            <div className="color-brand-900 mr-auto text-sm font-semibold">
              {title}
              <span className="ml-1 text-xs font-normal opacity-40">
                (~{percentage}% scanned)
              </span>
            </div>
          </div>
          {balance && (
            <div className="w-fit bg-brand-300 px-1.5 py-1 font-mono text-xs opacity-60">
              {balance}
            </div>
          )}
          <ExplorerLink
            chainId={chainId}
            value={address}
            type="address"
            hideLabel
          />
        </div>
        <div className="w-full grow">
          <div className="flex h-2">
            {ranges.map(({ range, status }) => {
              const width = ((range[1] - range[0]) / totalRange) * 100;

              return (
                <div
                  key={status + range[0] + range[1]}
                  className={cn("h-2", {
                    "bg-green-400": status === "scanned",
                    "bg-red-500": status === "failed",
                    "bg-brand-300": status === "pending",
                  })}
                  style={{ width: `${width}%`, minWidth: "1px" }}
                ></div>
              );
            })}
          </div>
          <div className="flex h-2 justify-between pt-2">
            <Tooltip value="Deployment block">
              <div className="font-mono text-xs text-brand-500">
                {ranges[0]?.range[0]}
              </div>
            </Tooltip>
            <Tooltip value="Last scanned block">
              <div className="ml-auto mr-3 font-mono text-xs text-green-400">
                {lastScannedBlock}
              </div>
            </Tooltip>
            <Tooltip value="Latest block">
              <div className="font-mono text-xs text-brand-500">
                {ranges[ranges.length - 1]?.range[1]}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </Box>
  );
};
