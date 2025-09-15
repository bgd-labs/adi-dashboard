import { notFound } from "next/navigation";

import { EnvelopeList } from "@/components/EnvelopeList";

const EnvelopeListPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ pageNumber: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) => {
  const resolvedParams = await params;
  const page = +resolvedParams.pageNumber;
  if (isNaN(page)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  return (
    <EnvelopeList
      currentPage={page}
      perPage={15}
      searchParams={resolvedSearchParams}
    />
  );
};

export default EnvelopeListPage;
