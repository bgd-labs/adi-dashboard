import { api } from "@/trpc/server";
import { Box } from "@/components/Box";
import { Button } from "@/components/Button";
import { EnvelopeListItem } from "./EnvelopeListItem";
import { EnvelopeFilters } from "./EnvelopeFilters";

export const EnvelopeList = async ({
  currentPage,
  perPage,
  searchParams,
}: {
  currentPage: number;
  perPage: number;
  searchParams: Record<string, string | undefined>;
}) => {
  const { data: envelopes, count } = await api.envelopes.getAll.query({
    pageSize: perPage,
    page: currentPage,
    from: searchParams?.from,
    to: searchParams?.to,
  });

  const chains = await api.controllers.getChains.query();

  if (!envelopes.length) {
    return (
      <>
        <EnvelopeFilters
          from={searchParams?.from}
          to={searchParams?.to}
          chains={chains}
        />
        <Box>
          <div className="flex h-96 items-center justify-center p-6">
            <div className="text-center">No envelopes found</div>
          </div>
        </Box>
      </>
    );
  }

  const hasNextPage = currentPage * perPage < count;
  const hasPreviousPage = currentPage > 1;

  return (
    <>
      <EnvelopeFilters
        from={searchParams?.from}
        to={searchParams?.to}
        chains={chains}
      />
      {envelopes.map((envelope) => (
        <EnvelopeListItem key={envelope.id} envelope={envelope} />
      ))}
      <Box className="border-b-brand-900">
        <div className="flex items-center justify-between gap-4 px-6 py-4 sm:mb-0">
          <Button
            href={hasPreviousPage ? `/${currentPage - 1}` : undefined}
            disabled={!hasPreviousPage}
            scroll={false}
            className="w-28"
          >
            Previous
          </Button>
          <div className="text-center text-sm opacity-50">
            <span className="hidden sm:inline">Page </span>
            {currentPage} of {Math.ceil(count / perPage)}
          </div>
          <Button
            href={hasNextPage ? `/${currentPage + 1}` : undefined}
            disabled={!hasNextPage}
            scroll={false}
            className="w-28"
          >
            Next
          </Button>
        </div>
      </Box>
    </>
  );
};

export const revalidate = 30;
