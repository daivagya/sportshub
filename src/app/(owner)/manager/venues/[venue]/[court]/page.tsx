import { getCourtByCourtSlug } from "../../../_actions/court.actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CourtDetailsPage } from "@/components/owner/client-components/CourtDetailsPage";

interface PageProps {
  params: {
    court: string;
  };
}

export const dynamic = "force-dynamic";

const CourtPage = async ({ params }: PageProps) => {
  const court = await getCourtByCourtSlug(params.court);
  return (
    <div>
      <CourtDetailsPage court={court} />
    </div>
  );
};

export default CourtPage;
