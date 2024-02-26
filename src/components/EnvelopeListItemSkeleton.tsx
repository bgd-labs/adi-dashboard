import { Box } from "@/components/Box";

export const EnvelopeListItemSkeleton = () => {
  return (
    <Box>
      <div className="animate-pulse px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-brand-900 opacity-20"></div>
          <div className="hidden xl:block">
            <div className="h-3 w-20 bg-brand-900 opacity-20"></div>
          </div>
          <div className="hidden md:block">
            <div className="xl:hidden">
              <div className="h-4 w-24 bg-brand-900"></div>
            </div>
          </div>
          <div className="hidden text-sm font-semibold text-brand-900 md:block">
            <div className="h-4 w-44 bg-brand-900 opacity-20"></div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="h-5 w-5 rounded-full bg-brand-900 opacity-20"></div>
            <div className="h-1 w-5 bg-brand-900 opacity-20"></div>
            <div className="h-5 w-5 rounded-full bg-brand-900 opacity-20"></div>
          </div>
          <div className="hidden md:block md:w-40">
            <div className="ml-auto h-4 w-28 bg-brand-900 opacity-20"></div>
          </div>
        </div>
        <div className="mt-6 text-left md:hidden">
          <div className="font-mono text-sm leading-none">
            <div className="h-4 w-24 bg-brand-900 opacity-20"></div>
          </div>
          <div className="mt-2">
            <div className="h-4 w-24 bg-brand-900 opacity-20"></div>
          </div>
        </div>
      </div>
    </Box>
  );
};
