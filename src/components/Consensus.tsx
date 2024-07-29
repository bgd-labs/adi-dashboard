import { type RouterOutput } from "@/server/api/types";
import { cn } from "@/utils/cn";

export const Consensus = ({
  value,
  config,
  hideIfSkipped,
}: {
  value: number;
  config?: RouterOutput["envelopes"]["getAll"]["data"][0]["consensus"];
  hideIfSkipped?: boolean;
}) => {
  if (!config?.confirmations_total) {
    return (
      <div
        className={cn(
          "w-16 px-2 py-1 text-center text-sm font-semibold text-brand-500",
        )}
      >
        N/A
      </div>
    );
  }

  const isConsensusReached = config.is_reached;

  if (config.skip) {
    return hideIfSkipped ? null : (
      <div className="text-center text-brand-300 sm:w-16">—</div>
    );
  }

  return (
    <div
      className={cn(
        "text-center text-sm font-semibold sm:w-16 sm:rounded-full sm:border sm:px-2 sm:py-1",
        {
          ["text-green-500 sm:border-green-100 sm:bg-green-50"]:
            isConsensusReached,
          ["text-red-500 sm:border-red-200 sm:bg-red-100"]: !isConsensusReached,
        },
      )}
    >
      {value}
      <span className="mx-1 font-normal">/</span>
      {config.confirmations_total}
    </div>
  );
};
