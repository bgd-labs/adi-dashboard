import { ChainIcon } from "@/components/ChainIcon";
import { cn } from "@/utils/cn";

type Props = {
  from: number | null;
  to: number | null;
  isBig?: boolean;
};

export const FromTo = ({ from, to, isBig }: Props) => {
  return (
    <div className="flex items-center gap-1 text-brand-500">
      <ChainIcon chainId={from} isBig={isBig} />
      <svg
        className={cn("h-6 w-6", { ["h-7 w-7"]: isBig })}
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
      <ChainIcon chainId={to} isBig={isBig} />
    </div>
  );
};
