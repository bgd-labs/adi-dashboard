"use client";
import * as RadixCheckbox from "@radix-ui/react-checkbox";

type Props = {
  children: React.ReactNode;
  id: string;
  onCheckedChange?: (e: boolean) => void;
};

export const Checkbox = ({ children, id, onCheckedChange }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute -left-0.5 top-0.5 h-full w-full bg-brand-900 opacity-10" />
        <RadixCheckbox.Root
          className="relative flex h-6 w-6 items-center justify-center rounded-none border border-brand-500 bg-white data-[state=checked]:border-brand-900 data-[state=checked]:bg-brand-900 data-[state=checked]:text-white"
          id={id}
          onCheckedChange={onCheckedChange}
        >
          <RadixCheckbox.Indicator>
            <svg
              className="h-5 w-5"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 25.6939L20.2344 35L43 11"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      </div>
      <label htmlFor={id} className="cursor-pointer">
        {children}
      </label>
    </div>
  );
};
