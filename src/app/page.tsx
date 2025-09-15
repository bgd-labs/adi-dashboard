import { EnvelopeList } from "@/components/EnvelopeList";

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) => {
  const resolvedSearchParams = await searchParams;
  return (
    <EnvelopeList
      currentPage={1}
      perPage={15}
      searchParams={resolvedSearchParams}
    />
  );
};

export default Home;
