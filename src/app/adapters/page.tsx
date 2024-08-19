import { AvailableAdapters } from "@/components/AvailableAdapters";
import { Box } from "@/components/Box";
import { ExplorerLink } from "@/components/ExplorerLink";
import { api } from "@/trpc/server";

const AdaptersPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) => {
  const { from, to } = searchParams;

  const availableAdapters =
    from && to
      ? await api.controllers.getAvailableAdapters({
          from: Number(searchParams.from),
          to: Number(searchParams.to),
        })
      : [];

  const chains = await api.controllers.getChains();

  return (
    <>
      <AvailableAdapters chains={chains} />
      {(!from || !to) && (
        <Box>
          <div className="flex h-96 items-center justify-center p-6">
            <div className="text-center">Select route</div>
          </div>
        </Box>
      )}
      {availableAdapters.map((adapter) => (
        <Box key={adapter.currentChainBridgeAdapter}>
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
            <ExplorerLink
              type="address"
              value={adapter.currentChainBridgeAdapter}
              chainId={Number(from)}
              skipAdapter
            />
            <svg
              className="h-6 w-6 shrink-0 grow rotate-90 text-brand-500 md:rotate-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13.75 6.75L19.25 12L13.75 17.25"
              />
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 12H4.75"
              />
            </svg>
            <ExplorerLink
              type="address"
              value={adapter.destinationBridgeAdapter}
              chainId={Number(to)}
              skipAdapter
            />
          </div>
        </Box>
      ))}
      {from && to && availableAdapters.length === 0 && (
        <Box>
          <div className="flex h-96 items-center justify-center p-6">
            <div className="text-center">No adapters found</div>
          </div>
        </Box>
      )}
    </>
  );
};

export default AdaptersPage;
