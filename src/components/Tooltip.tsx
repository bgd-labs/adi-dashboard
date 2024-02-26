"use client";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export const Tooltip = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={0}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
            <RadixTooltip.Arrow className="" />
            {value}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
