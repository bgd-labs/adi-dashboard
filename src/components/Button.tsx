"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ForwardedRef, forwardRef } from "react";

import { Spinner } from "@/components/Spinner";
import { cn } from "@/utils/cn";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  scroll?: boolean;
  className?: string;
  submit?: boolean;
  type?: "danger" | "primary";
  loading?: boolean;
  fullWidth?: boolean;
};

// eslint-disable-next-line react/display-name
export const Button = forwardRef(
  (
    {
      children,
      onClick,
      href,
      disabled,
      scroll = true,
      className,
      type,
      submit = false,
      loading = false,
      fullWidth = false,
    }: Props,
    ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    const button = (
      <>
        <span className="absolute left-0 top-0 h-full w-full">
          <span
            className={cn(
              "will-change[transform] ease-cubic-bezier[.3,.7,.4,1] absolute bottom-0 left-0 h-1 w-full translate-x-0.5 skew-x-[-45deg] border border-l-0 border-t-0 border-brand-900 bg-brand-300 transition-all group-active/button:translate-x-0 group-active/button:skew-x-0 group-active/button:scale-y-0",
              {
                ["hidden"]: disabled,
                ["bg-red-100"]: type === "danger",
              },
            )}
          />
          <span
            className={cn(
              "will-change[transform] ease-cubic-bezier[.3,.7,.4,1] absolute bottom-0 left-0 h-full w-1 -translate-y-0.5 skew-y-[-45deg] border border-r-0 border-brand-900 bg-brand-500 transition-all group-active/button:translate-y-0 group-active/button:skew-y-0 group-active/button:scale-x-0",
              {
                ["hidden"]: disabled,
                ["bg-red-300"]: type === "danger",
              },
            )}
          />
        </span>
        <span
          className={cn(
            "will-change[transform] ease-cubic-bezier[.3,.7,.4,1] relative block grid -translate-y-1 translate-x-1 transform select-none grid-flow-col items-center gap-2 border border-brand-900 bg-white px-3 py-1 text-center text-brand-900 transition-all hover:bg-brand-100 group-active/button:-translate-y-0 group-active/button:translate-x-0",
            className,
            {
              ["translate-x-0 translate-y-0 border-brand-500 text-brand-500"]:
                disabled,
              ["bg-red-500 text-white hover:bg-red-600"]: type === "danger",
            },
          )}
        >
          {loading && <Spinner className="h-5 w-5" />}
          {children}
        </span>
      </>
    );

    if (href) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const searchParams = useSearchParams();

      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const proposalId = searchParams.get("proposalId");
      const payloadId = searchParams.get("payloadId");

      const query: Record<string, string | undefined> = {};
      if (from) query.from = from;
      if (to) query.to = to;
      if (proposalId) query.proposalId = proposalId;
      if (payloadId) query.payloadId = payloadId;

      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          href={{
            pathname: href,
            query,
          }}
          scroll={scroll}
          className={cn(
            "outline-offset[4px] group/button relative cursor-pointer border-none p-0 focus:outline-none",
            {
              "cursor-not-allowed": disabled,
            },
          )}
        >
          {button}
        </Link>
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        className={cn(
          "outline-offset[4px] group/button relative cursor-pointer border-none p-0 focus:outline-none",
          {
            "cursor-not-allowed": disabled,
            "w-full": fullWidth,
          },
        )}
        onClick={onClick}
        disabled={disabled}
        type={submit ? "submit" : "button"}
      >
        {button}
      </button>
    );
  },
);
