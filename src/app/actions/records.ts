"use server";

import { getSession } from "@/lib/auth";
import {
  addJob,
  addLead,
  getJobsPage,
  getLead,
  getLeadsPage,
  updateJobStatus,
  updateLeadStatus,
} from "@/lib/store";
import { buildLeadEmailText, htmlToText } from "@/lib/lead-email";
import { sendOutreachEmail } from "@/lib/mail";
import type { LeadChannel } from "@/lib/leads";
import type { Job, JobStatus, Lead, LeadStatus } from "@/data/examples";

export async function listJobsAction(status: JobStatus, page: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getJobsPage(status, page);
}

export async function listLeadsAction(
  status: LeadStatus,
  page: number,
  channel: LeadChannel = "all",
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getLeadsPage(status, page, channel);
}

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

export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return updateLeadStatus(id, status);
}

export async function sendLeadEmailAction(input: {
  leadId: string;
  subject: string;
  html: string;
  intro?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const subject = input.subject.trim();
  const html = input.html.trim();
  if (!subject) return { ok: false as const, error: "Subject is required." };
  if (!html) return { ok: false as const, error: "Email content is required." };
  if (html.length > 200_000) {
    return { ok: false as const, error: "Email content is too large." };
  }

  const lead = await getLead(input.leadId);
  if (!lead) return { ok: false as const, error: "Lead not found." };
  const to = lead.email.trim();
  if (!to) return { ok: false as const, error: "This lead has no email." };

  const text = input.intro?.trim()
    ? buildLeadEmailText(input.intro)
    : htmlToText(html);

  try {
    await sendOutreachEmail({ to, subject, html, text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send email.";
    return { ok: false as const, error: message };
  }

  const keepStatus: LeadStatus[] = ["lead", "won", "closed"];
  const nextStatus = keepStatus.includes(lead.status)
    ? lead.status
    : "contacted";
  const updated =
    nextStatus === lead.status
      ? lead
      : ((await updateLeadStatus(lead.id, nextStatus)) ?? lead);

  return { ok: true as const, lead: updated };
}
