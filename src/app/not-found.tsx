import { Box } from "@/components/Box";

const NotFound = () => {
  return (
    <Box>
      <div className="flex flex-col items-center justify-center py-64">
        <h1 className="text-9xl font-bold mb-4 text-brand-900 opacity-900 relative">
          <span className="absolute top-0 left-0 -translate-x-1.5 translate-y-1.5 opacity-10">404</span>
          <span className="relative">404</span>
        </h1>
        <div className="text-brand-900 opacity-60 text-lg">
          Page not found
        </div>
      </div>
    </Box>
  );
};

export default NotFound;
