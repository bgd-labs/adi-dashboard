import { Box } from "@/components/Box";

const Loading = () => {
  return (
    <>
      {Array.from({ length: 9 }).map((_, index) => (
        <Box key={index}>
          <div className="flex animate-pulse flex-col items-center gap-4 px-6 py-6 pb-10 sm:flex-row">
            <div className="h-5 w-5 rounded-full bg-brand-300 shrink-0"></div>
            <div className="color-brand-900 h-4 w-44 bg-brand-300"></div>
            <div className="h-4 w-14 bg-brand-100"></div>
            <div className="w-full sm:-mb-6">
              <div className="flex h-6">
                <div className="h-6 w-1/3 bg-brand-300"></div>
                <div className="h-6 w-1/3 bg-brand-300"></div>
                <div className="h-6 w-1/3 bg-brand-300"></div>
              </div>
              <div className="flex h-6 justify-between px-1 pt-1">
                <div className="h-4 w-10 bg-brand-100"></div>
                <div className="h-4 w-10 bg-brand-100"></div>
              </div>
            </div>
          </div>
        </Box>
      ))}
    </>
  );
};

export default Loading;
