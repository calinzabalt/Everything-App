"use server";

import { getSession } from "@/lib/auth";
import { addJob, addLead, updateJobStatus, updateLeadStatus } from "@/lib/store";
import type { Job, JobStatus, Lead } from "@/data/examples";

export async function createJobAction(job: Job) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return addJob(job);
}

export async function updateJobStatusAction(id: string, status: JobStatus) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return updateJobStatus(id, status);
}

export async function createLeadAction(lead: Lead) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return addLead(lead);
}

export async function updateLeadStatusAction(id: string, status: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return updateLeadStatus(id, status);
}
