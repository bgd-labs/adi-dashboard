import { Box } from "@/components/Box";
import { EnvelopeListItemSkeleton } from "@/components/EnvelopeListItemSkeleton";

const Loading = () => {
  return (
    <>
      <Box className="flex flex-col items-center justify-between gap-3 bg-brand-300 px-3 py-3 md:flex-row md:gap-6 md:px-6">
        <div className="flex w-full gap-2">
          <div className="h-9 w-32 grow bg-white md:grow-0" />
          <div className="h-9 w-32 grow bg-white md:grow-0" />
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="h-9 w-32 grow bg-white md:grow-0" />
          <div className="h-2 w-4 bg-brand-500" />
          <div className="h-9 w-32 grow bg-white md:grow-0" />
        </div>
      </Box>
      {Array.from({ length: 15 }).map((_, index) => (
        <EnvelopeListItemSkeleton key={index} />
      ))}
      <Box className="border-b-brand-900">
        <div className="flex animate-pulse items-center justify-between gap-4 px-6 py-4 sm:mb-0">
          <div className="h-8 w-28 animate-pulse bg-brand-300" />
          <div>
            <div className="h-4 w-16 animate-pulse bg-brand-300 sm:w-28" />
          </div>
          <div className="h-8 w-28 animate-pulse bg-brand-300" />
        </div>
      </Box>
    </>
  );
};

export default Loading;
