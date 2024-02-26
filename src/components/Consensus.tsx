import { cn } from "@/utils/cn";
import { type RouterOutput } from "@/server/api/types";

export const Consensus = ({
  value,
  config,
}: {
  value: number;
  config?: RouterOutput["envelopes"]["getAll"]["data"][0]["consensus"];
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
    return <div className="sm:w-16"></div>;
  }

  return (
    <div
      className={cn("sm:rounded-full sm:w-16 sm:border sm:px-2 sm:py-1 text-center text-sm font-semibold", {
        ["sm:border-green-100 sm:bg-green-50 text-green-500"]: isConsensusReached,
        ["sm:border-red-200 sm:bg-red-100 text-red-500"]: !isConsensusReached,
      })}
    >
      {value}
      <span className="mx-1 font-normal">/</span>
      {config.confirmations_total}
    </div>
  );
};
