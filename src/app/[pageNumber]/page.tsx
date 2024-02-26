import { EnvelopeList } from "@/components/EnvelopeList";
import { notFound } from "next/navigation";

const EnvelopeListPage = async ({
  params,
}: {
  params: { pageNumber: string };
}) => {
  const page = +params.pageNumber;
  if (isNaN(page)) {
    notFound();
  }

  return <EnvelopeList currentPage={page} perPage={15} />;
};

export const revalidate = 30;

export default EnvelopeListPage;
