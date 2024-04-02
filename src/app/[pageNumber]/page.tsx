import { EnvelopeList } from "@/components/EnvelopeList";
import { notFound } from "next/navigation";

const EnvelopeListPage = async ({
  params,
  searchParams,
}: {
  params: { pageNumber: string };
  searchParams: Record<string, string | undefined>;
}) => {
  const page = +params.pageNumber;
  if (isNaN(page)) {
    notFound();
  }

  return <EnvelopeList currentPage={page} perPage={15} searchParams={searchParams} />;
};

export default EnvelopeListPage;
