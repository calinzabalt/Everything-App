import { JobsBoard } from "@/components/jobs-board";
import { getJobs } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getJobs();
  return <JobsBoard jobs={jobs} />;
}
