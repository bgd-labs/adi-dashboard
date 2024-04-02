import { EnvelopeList } from "@/components/EnvelopeList";

const Home = async ({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) => {
  return (
    <EnvelopeList currentPage={1} perPage={15} searchParams={searchParams} />
  );
};

export default Home;
