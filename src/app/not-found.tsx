import { Box } from "@/components/Box";

const NotFound = () => {
  return (
    <Box>
      <div className="flex flex-col items-center justify-center py-64">
        <h1 className="opacity-900 relative mb-4 text-9xl font-bold text-brand-900">
          <span className="absolute left-0 top-0 -translate-x-1.5 translate-y-1.5 opacity-10">
            404
          </span>
          <span className="relative">404</span>
        </h1>
        <div className="text-lg text-brand-900 opacity-60">Page not found</div>
      </div>
    </Box>
  );
};

export default NotFound;
