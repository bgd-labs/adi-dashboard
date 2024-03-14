import { EnvelopeListItemSkeleton } from "@/components/EnvelopeListItemSkeleton";
import { Box } from "@/components/Box";

const Loading = () => {
  return (
    <>
      <Box className="border-b-brand-900 bg-brand-300">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="h-7 w-32 bg-white"></div>
          <div className="h-2 w-4 bg-brand-500"></div>
          <div className="h-7 w-32 bg-brand-100"></div>
        </div>
      </Box>
      {Array.from({ length: 15 }).map((_, index) => (
        <EnvelopeListItemSkeleton key={index} />
      ))}
      <Box className="border-b-brand-900">
        <div className="flex animate-pulse items-center justify-between gap-4 px-6 py-4 sm:mb-0">
          <div className="h-8 w-28 animate-pulse bg-brand-300"></div>
          <div>
            <div className="h-4 w-16 animate-pulse bg-brand-300 sm:w-28"></div>
          </div>
          <div className="h-8 w-28 animate-pulse bg-brand-300"></div>
        </div>
      </Box>
    </>
  );
};

export default Loading;
