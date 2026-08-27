import { LeadsBoard } from "@/components/leads-board";
import { getLeads } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadsBoard leads={leads} />;
}
