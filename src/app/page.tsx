import { EnvelopeList } from "@/components/EnvelopeList";

const Home = async () => {
  return <EnvelopeList currentPage={1} perPage={15} />;
};

export const revalidate = 30;

export default Home;
