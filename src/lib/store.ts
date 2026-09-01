import type { Job as DbJob, Lead as DbLead, LeadStatus, Prisma } from "@prisma/client";
import {
  type Job,
  type JobStatus,
  type Lead,
} from "@/data/examples";
import { emptyLeadCounts, parseLeadStatus, type LeadChannel } from "@/lib/leads";
import { PAGE_SIZE } from "@/lib/paging";
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
  return parseLeadStatus(status);
}

function leadFromDb(row: DbLead): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    url: row.url ?? "",
    location: row.location ?? "",
    country: row.country ?? "",
    note: row.note ?? "",
    source: row.source ?? "",
    status: row.status,
  };
}

export type JobsPage = {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<JobStatus, number>;
};

export type LeadsPage = {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<LeadStatus, number>;
};

export type DashboardStats = {
  jobs: {
    total: number;
    not_applied: number;
    applied: number;
    deleted: number;
    byCountry: Record<string, number>;
  };
  leads: {
    saved: number;
    new: number;
    contacted: number;
    lead: number;
    bySource: Record<string, number>;
  };
};

function clampPage(page: number) {
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

function tally(
  rows: { label: string | null; count: number }[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const row of rows) {
    const label = row.label?.trim();
    if (!label || label === "—") continue;
    result[label] = row.count;
  }
  return result;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [jobStatusCounts, jobCountries, leadStatusCounts, leadSources] =
    await Promise.all([
      prisma.job.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.job.groupBy({
        by: ["country"],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: { status: { not: "deleted" } },
        _count: { _all: true },
      }),
    ]);

  const jobs = {
    total: 0,
    not_applied: 0,
    applied: 0,
    deleted: 0,
    byCountry: tally(
      jobCountries.map((row) => ({
        label: row.country,
        count: row._count._all,
      })),
    ),
  };
  for (const row of jobStatusCounts) {
    jobs[row.status] = row._count._all;
    jobs.total += row._count._all;
  }

  let saved = 0;
  const leadCounts = { ...emptyLeadCounts };
  for (const row of leadStatusCounts) {
    leadCounts[row.status] = row._count._all;
    if (row.status !== "deleted") saved += row._count._all;
  }

  return {
    jobs,
    leads: {
      saved,
      new: leadCounts.new,
      contacted: leadCounts.contacted,
      lead: leadCounts.lead,
      bySource: tally(
        leadSources.map((row) => ({
          label: row.source,
          count: row._count._all,
        })),
      ),
    },
  };
}

export async function getJobsPage(
  status: JobStatus,
  page: number,
  pageSize = PAGE_SIZE,
): Promise<JobsPage> {
  const safePage = clampPage(page);
  const where = { status };
  const [rows, total, grouped] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
    prisma.job.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts: Record<JobStatus, number> = {
    not_applied: 0,
    applied: 0,
    deleted: 0,
  };
  for (const row of grouped) {
    counts[row.status] = row._count._all;
  }

  return {
    items: rows.map(jobFromDb),
    total,
    page: safePage,
    pageSize,
    counts,
  };
}

function leadListWhere(
  status: LeadStatus,
  channel: LeadChannel,
): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = { status };
  if (channel === "email") {
    where.AND = [{ email: { not: null } }, { email: { not: "" } }];
  } else if (channel === "phone") {
    where.AND = [{ phone: { not: null } }, { phone: { not: "" } }];
  } else if (channel === "url") {
    where.AND = [{ url: { not: null } }, { url: { not: "" } }];
  }
  return where;
}

export async function getLeadsPage(
  status: LeadStatus,
  page: number,
  channel: LeadChannel = "all",
  pageSize = PAGE_SIZE,
): Promise<LeadsPage> {
  const safePage = clampPage(page);
  const where = leadListWhere(status, channel);
  const [rows, total, grouped] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts = { ...emptyLeadCounts };
  for (const row of grouped) {
    counts[row.status] = row._count._all;
  }

  return {
    items: rows.map(leadFromDb),
    total,
    page: safePage,
    pageSize,
    counts,
  };
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
  const url = (input.url ?? "").trim();
  const location = optionalText(input.location);

  const existing = email
    ? await prisma.lead.findFirst({ where: { email } })
    : await prisma.lead.findFirst({
        where: { name, location },
      });
  if (existing) {
    const next = {
      email: existing.email || email || null,
      phone: existing.phone || phone || null,
      url: existing.url || url || null,
    };
    if (
      next.email !== existing.email ||
      next.phone !== existing.phone ||
      next.url !== existing.url
    ) {
      const row = await prisma.lead.update({
        where: { id: existing.id },
        data: next,
      });
      return leadFromDb(row);
    }
    return leadFromDb(existing);
  }

  const row = await prisma.lead.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      url: url || null,
      location,
      country: optionalText(input.country),
      note: input.note.trim() || null,
      source: input.source.trim() || "Grok",
      status: leadStatusToDb(input.status || "new"),
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
