import { Box } from "@/components/Box";

const Loading = () => {
  return (
    <>
      <Box>
        <div className="animate-pulse px-4 py-6 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="h-14 w-14 bg-brand-300" />
            <div className="hidden translate-y-1 sm:block">
              <div className="mb-1 h-4 w-32 bg-brand-300" />
              <div className="h-6 w-44 bg-brand-300" />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="h-7 w-7 rounded-full bg-brand-300" />
              <div className="h-1 w-7 bg-brand-300" />
              <div className="h-7 w-7 rounded-full bg-brand-300" />
            </div>
          </div>
          <div className="mt-4 sm:hidden">
            <div className="mb-1 h-4 w-32 bg-brand-300" />
            <div className="h-7 w-44 bg-brand-300" />
          </div>
        </div>
        <div className="animate-pulse px-4 pb-6 sm:px-6">
          <div className="grid gap-4 border-t pt-5 lg:grid-cols-2">
            <div>
              <div className="mb-1 h-4 w-32 bg-brand-300" />
              <div className="h-6 w-44 bg-brand-300" />
            </div>
            <div>
              <div className="mb-1 h-4 w-32 bg-brand-300" />
              <div className="h-6 w-44 bg-brand-300" />
            </div>
          </div>
          <div className="pt-6">
            <div className="mb-1 h-4 w-32 bg-brand-300" />
            <div className="h-6 bg-brand-300" />
          </div>
        </div>
      </Box>
      <Box>
        <div className="animate-pulse px-4 py-6 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="mb-1 h-4 w-32 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
            </div>
            <div className="grid gap-2">
              <div className="mb-1 h-4 w-32 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
              <div className="h-6 w-8/12 bg-brand-300" />
            </div>
          </div>
        </div>
      </Box>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box key={index}>
          <div className="animate-pulse px-4 py-4 sm:px-6">
            <span className="flex items-center gap-2 sm:gap-4">
              <div className="h-5 w-5 rounded-full bg-brand-300" />
              <div className="h-4 w-20 bg-brand-300" />
              <div className="ml-auto h-4 w-20 bg-brand-300" />
            </span>
          </div>
        </Box>
      ))}
    </>
  );
};

export default Loading;
