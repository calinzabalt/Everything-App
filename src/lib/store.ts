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
    kind: row.kind,
    emailOptOut: row.emailOptOut,
    emailedAt: row.emailedAt?.toISOString() ?? null,
    followUpSentAt: row.followUpSentAt?.toISOString() ?? null,
    repliedAt: row.repliedAt?.toISOString() ?? null,
    replyText: row.replyText ?? "",
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
        _max: { createdAt: true },
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
        [...leadSources]
          .sort((a, b) => {
            const aTime = a._max.createdAt?.getTime() ?? 0;
            const bTime = b._max.createdAt?.getTime() ?? 0;
            return bTime - aTime;
          })
          .slice(0, 3)
          .map((row) => ({
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
  kind: "all" | "client" | "partner" = "all",
): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = { status };
  if (kind === "client" || kind === "partner") where.kind = kind;
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
  kind: "all" | "client" | "partner" = "all",
): Promise<LeadsPage> {
  const safePage = clampPage(page);
  const where = leadListWhere(status, channel, kind);
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
    const emailOptOut =
      existing.emailOptOut ||
      input.emailOptOut ||
      (email ? await isEmailOptedOut(email) : false);
    const next = {
      email: existing.email || email || null,
      phone: existing.phone || phone || null,
      url: existing.url || url || null,
      emailOptOut,
    };
    if (
      next.email !== existing.email ||
      next.phone !== existing.phone ||
      next.url !== existing.url ||
      next.emailOptOut !== existing.emailOptOut
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
      kind: input.kind === "partner" ? "partner" : "client",
      emailOptOut: input.emailOptOut || (await isEmailOptedOut(email)),
    },
  });
  return leadFromDb(row);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listOptedOutEmails() {
  const rows = await prisma.lead.findMany({
    where: {
      emailOptOut: true,
      AND: [{ email: { not: null } }, { email: { not: "" } }],
    },
    select: { email: true },
  });
  return [
    ...new Set(
      rows
        .map((row) => normalizeEmail(row.email ?? ""))
        .filter(Boolean),
    ),
  ];
}

export async function isEmailOptedOut(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM leads
    WHERE emailOptOut = true AND LOWER(email) = ${normalized}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function markEmailsOptedOut(emails: string[]) {
  const unique = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  for (const email of unique) {
    const updated = await prisma.$executeRaw`
      UPDATE leads
      SET emailOptOut = true
      WHERE LOWER(email) = ${email}
    `;
    if (Number(updated) > 0) continue;
    await prisma.lead.create({
      data: {
        name: email,
        email,
        source: "Opt out",
        status: "closed",
        emailOptOut: true,
      },
    });
  }
  return unique;
}

export async function getLead(id: string) {
  const row = await prisma.lead.findUnique({ where: { id } });
  return row ? leadFromDb(row) : null;
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

export async function updateLeadKind(id: string, kind: "client" | "partner") {
  try {
    const row = await prisma.lead.update({
      where: { id },
      data: { kind },
    });
    return leadFromDb(row);
  } catch {
    return null;
  }
}

export async function markLeadEmailed(id: string, followUp: boolean) {
  const current = await prisma.lead.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.lead.update({
    where: { id },
    data: followUp
      ? { followUpSentAt: new Date() }
      : { emailedAt: current.emailedAt ?? new Date() },
  });
  return leadFromDb(row);
}

function replyIsStop(subject: string, body: string) {
  const first = body
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean)
    ?.toLowerCase()
    .replace(/[.!]+$/, "");
  const whole = body.trim().toLowerCase();
  const words = ["stop", "unsubscribe", "remove me"];
  return (
    subject.trim().toLowerCase() === "stop" ||
    words.some((word) => first === word || whole === word)
  );
}

export async function recordInboundReply(input: {
  from: string;
  subject: string;
  body: string;
}) {
  const email = input.from.trim().toLowerCase();
  if (!email || email === "hello@sienaworks.com") return { ignored: true as const };
  const body = input.body.trim().slice(0, 4000);
  if (replyIsStop(input.subject, body)) {
    await markEmailsOptedOut([email]);
    return { optedOut: true as const, email };
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM leads WHERE LOWER(email) = ${email}
  `;
  const now = new Date();
  if (rows.length === 0) {
    const created = await prisma.lead.create({
      data: {
        name: email,
        email,
        source: "Reply",
        status: "lead",
        repliedAt: now,
        replyText: body || input.subject,
      },
    });
    return { lead: leadFromDb(created) };
  }

  let last = null;
  for (const row of rows) {
    const current = await prisma.lead.findUnique({ where: { id: row.id } });
    if (!current) continue;
    const keep: LeadStatus[] = ["won", "closed", "deleted"];
    last = await prisma.lead.update({
      where: { id: row.id },
      data: {
        repliedAt: current.repliedAt ?? now,
        replyText: body || input.subject,
        status: keep.includes(current.status) ? current.status : "lead",
      },
    });
  }
  return last ? { lead: leadFromDb(last) } : { ignored: true as const };
}

export async function saveJobAsLead(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return null;
  const name = (job.company ?? "").trim();
  return addLead({
    name: name && name !== "—" ? name : job.title,
    email: "",
    phone: "",
    url: "",
    location: job.location ?? "",
    country: job.country ?? "",
    note: `${job.title}\n${job.url}`,
    source: "Job",
    status: "new",
    kind: "client",
    emailOptOut: false,
    emailedAt: null,
    followUpSentAt: null,
    repliedAt: null,
    replyText: "",
  });
}

export type SourceReport = {
  source: string;
  sent: number;
  replied: number;
  won: number;
};

export async function getOutreachReport(): Promise<SourceReport[]> {
  const rows = await prisma.lead.findMany({
    where: { status: { not: "deleted" } },
    select: {
      source: true,
      emailedAt: true,
      repliedAt: true,
      status: true,
    },
  });
  const bySource = new Map<string, SourceReport>();
  for (const row of rows) {
    const source = row.source?.trim() || "Unknown";
    const current = bySource.get(source) ?? { source, sent: 0, replied: 0, won: 0 };
    const sent =
      row.emailedAt != null ||
      row.status === "contacted" ||
      row.status === "lead" ||
      row.status === "won";
    if (sent) current.sent += 1;
    if (row.repliedAt != null || row.status === "lead") current.replied += 1;
    if (row.status === "won") current.won += 1;
    bySource.set(source, current);
  }
  return [...bySource.values()]
    .filter((row) => row.sent > 0 || row.replied > 0 || row.won > 0)
    .sort((a, b) => b.sent - a.sent || b.replied - a.replied);
}
