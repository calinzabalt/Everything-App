import { NextResponse } from "next/server";
import { isIngestAuthorized } from "@/lib/ingest-auth";
import { addJob } from "@/lib/store";
import type { Job } from "@/data/examples";

export const runtime = "nodejs";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function skillsFrom(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function jobFrom(body: Record<string, unknown>): Omit<Job, "id"> | null {
  const title = text(body.title) || text(body.role);
  const url =
    text(body.url) || text(body.applyUrl) || text(body.apply_link) || text(body.link);
  if (!title || !url) return null;

  const levelRaw = text(body.level);
  return {
    title,
    url,
    company: text(body.company),
    location: text(body.location),
    country: text(body.country),
    level: levelRaw.toLowerCase() === "senior" ? "Senior" : "Mid",
    skills: skillsFrom(body.skills),
    source: text(body.source) || "Grok",
    status: "not_applied",
  };
}

export async function POST(request: Request) {
  if (!isIngestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const records = Array.isArray(body)
    ? body
    : body && typeof body === "object" && Array.isArray((body as { jobs?: unknown }).jobs)
      ? (body as { jobs: unknown[] }).jobs
      : [body];

  const jobs: Job[] = [];
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const parsed = jobFrom(record as Record<string, unknown>);
    if (!parsed) {
      return NextResponse.json(
        { error: "Each job needs title (or role) and url (or applyUrl)." },
        { status: 400 },
      );
    }
    jobs.push(await addJob(parsed));
  }

  return NextResponse.json({ ok: true, count: jobs.length, jobs });
}
