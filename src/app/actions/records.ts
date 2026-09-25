"use server";

import { getSession } from "@/lib/auth";
import {
  addJob,
  addLead,
  getDashboardStats,
  getJobsPage,
  getLead,
  getLeadsPage,
  updateJobStatus,
  getOutreachReport,
  isEmailOptedOut,
  markLeadEmailed,
  saveJobAsLead,
  updateLeadKind,
  updateLeadStatus,
} from "@/lib/store";
import { buildLeadEmailText, htmlToText } from "@/lib/lead-email";
import { sendOutreachEmail } from "@/lib/mail";
import { OUTREACH_BLOCKED_MESSAGE, outreachBlocked } from "@/lib/outreach";
import { followUpReady, type LeadChannel } from "@/lib/leads";
import type { Job, JobStatus, Lead, LeadStatus } from "@/data/examples";

export async function getDashboardStatsAction() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getDashboardStats();
}

export async function listJobsAction(status: JobStatus, page: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getJobsPage(status, page);
}

export async function listLeadsAction(
  status: LeadStatus,
  page: number,
  channel: LeadChannel = "all",
  kind: "all" | "client" | "partner" = "all",
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getLeadsPage(status, page, channel, undefined, kind);
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

export async function updateLeadKindAction(id: string, kind: "client" | "partner") {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return updateLeadKind(id, kind);
}

export async function saveJobAsLeadAction(jobId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return saveJobAsLead(jobId);
}

export async function getOutreachReportAction() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return getOutreachReport();
}

export async function sendLeadEmailAction(input: {
  leadId: string;
  subject: string;
  html: string;
  intro?: string;
  followUp?: boolean;
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
  if (lead.emailOptOut || (await isEmailOptedOut(to))) {
    return {
      ok: false as const,
      error: "This address opted out. We will not email them again.",
    };
  }
  if (outreachBlocked(lead)) {
    return { ok: false as const, error: OUTREACH_BLOCKED_MESSAGE };
  }
  if (input.followUp && !followUpReady(lead)) {
    return {
      ok: false as const,
      error: "A follow-up is only sent once, a week after the first email, if they have not replied.",
    };
  }

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
  const stamped = await markLeadEmailed(lead.id, Boolean(input.followUp));
  if (!stamped) return { ok: false as const, error: "Email sent, but the lead could not be updated." };
  const updated =
    nextStatus === lead.status
      ? stamped
      : ((await updateLeadStatus(lead.id, nextStatus)) ?? stamped);

  return { ok: true as const, lead: updated };
}
