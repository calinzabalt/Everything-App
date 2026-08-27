import type { Job as DbJob, Lead as DbLead, LeadStatus } from "@prisma/client";
import {
  type Job,
  type JobStatus,
  type Lead,
} from "@/data/examples";
import { prisma } from "@/lib/prisma";

function optionalText(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return null;
  return trimmed;
}

function skillsFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function jobFromDb(row: DbJob): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company ?? "—",
    location: row.location ?? "",
    country: row.country ?? "",
    level: row.level === "senior" ? "Senior" : "Mid",
    skills: skillsFrom(row.skills),
    source: row.source ?? "",
    url: row.url,
    status: row.status,
  };
}

function leadStatusToDb(status: string): LeadStatus {
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (
    key === "emailed" ||
    key === "followed_up" ||
    key === "replied" ||
    key === "won" ||
    key === "closed" ||
    key === "deleted"
  ) {
    return key;
  }
  return "new";
}

function leadStatusFromDb(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    new: "New",
    emailed: "Emailed",
    followed_up: "Followed up",
    replied: "Replied",
    won: "Won",
    closed: "Closed",
    deleted: "Deleted",
  };
  return labels[status];
}

function leadFromDb(row: DbLead): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    location: row.location ?? "",
    country: row.country ?? "",
    note: row.note ?? "",
    source: row.source ?? "",
    status: leadStatusFromDb(row.status),
  };
}

export async function getJobs() {
  const rows = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(jobFromDb);
}

export async function getLeads() {
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(leadFromDb);
}

export async function addJob(input: Omit<Job, "id"> & { id?: string }) {
  const url = input.url.trim();
  const existing = await prisma.job.findFirst({ where: { url } });
  if (existing) return jobFromDb(existing);

  const row = await prisma.job.create({
    data: {
      title: input.title.trim(),
      url,
      company: input.company.trim() || "—",
      location: optionalText(input.location),
      country: optionalText(input.country),
      level: input.level === "Senior" ? "senior" : "mid",
      skills: input.skills ?? [],
      source: input.source.trim() || "Grok",
      status: input.status ?? "not_applied",
    },
  });
  return jobFromDb(row);
}

export async function updateJobStatus(id: string, status: JobStatus) {
  try {
    const row = await prisma.job.update({
      where: { id },
      data: { status },
    });
    return jobFromDb(row);
  } catch {
    return null;
  }
}

export async function addLead(input: Omit<Lead, "id"> & { id?: string }) {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = (input.phone ?? "").trim();
  const location = optionalText(input.location);

  const existing = email
    ? await prisma.lead.findFirst({ where: { email } })
    : await prisma.lead.findFirst({
        where: { name, location },
      });
  if (existing) return leadFromDb(existing);

  const row = await prisma.lead.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      location,
      country: optionalText(input.country),
      note: input.note.trim() || null,
      source: input.source.trim() || "Grok",
      status: leadStatusToDb(input.status || "New"),
    },
  });
  return leadFromDb(row);
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    const row = await prisma.lead.update({
      where: { id },
      data: { status: leadStatusToDb(status) },
    });
    return leadFromDb(row);
  } catch {
    return null;
  }
}
