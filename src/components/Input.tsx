import * as React from "react";

import { cn } from "@/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative grow md:grow-0">
        <div className="absolute -left-0.5 top-0.5 h-full w-full bg-brand-900 opacity-10" />
        <input
          type={type}
          className={cn(
            "rounded-none w-full md:w-28 relative h-9 border border-brand-500 bg-white px-3 py-2 text-sm placeholder-brand-500 shadow-sm focus:border-brand-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
