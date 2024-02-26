import { ChainIcon } from "@/components/ChainIcon";
import { Box } from "@/components/Box";
import { type RangeStatus } from "@/server/eventCollection/types";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/utils/cn";

type ChartProps = {
  ranges: RangeStatus[];
  title?: string;
  chainId?: number;
  lastScannedBlock?: number;
};

export const ScanChart = ({
  ranges,
  title,
  chainId,
  lastScannedBlock,
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
      <div className="flex flex-col items-center gap-4 px-6 py-6 pb-10 sm:flex-row">
        <ChainIcon chainId={chainId} />
        <div className="color-brand-900 w-44 text-center font-semibold sm:text-left">
          {title}
        </div>
        <div className="w-14 text-center text-xs font-normal text-brand-500">
          {percentage}%
        </div>
        <div className="w-full grow sm:-mb-6">
          <div className="flex h-6">
            {ranges.map(({ range, status }) => {
              const width = ((range[1] - range[0]) / totalRange) * 100;

              return (
                <div
                  key={status + range[0] + range[1]}
                  className={cn("h-6", {
                    "bg-green-400": status === "scanned",
                    "bg-red-500": status === "failed",
                    "bg-brand-300": status === "pending",
                  })}
                  style={{ width: `${width}%`, minWidth: "1px" }}
                ></div>
              );
            })}
          </div>
          <div className="flex h-6 justify-between pt-1">
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
