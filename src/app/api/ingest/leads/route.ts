import { NextResponse } from "next/server";
import { isIngestAuthorized } from "@/lib/ingest-auth";
import { addLead } from "@/lib/store";
import type { Lead } from "@/data/examples";

export const runtime = "nodejs";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function leadFrom(body: Record<string, unknown>): Omit<Lead, "id"> | null {
  const name = text(body.name) || text(body.business) || text(body.company);
  if (!name) return null;

  return {
    name,
    email: text(body.email),
    phone: text(body.phone) || text(body.phoneNumber) || text(body.phone_number),
    location: text(body.location),
    country: text(body.country),
    note: text(body.note) || text(body.notes),
    source: text(body.source) || "Grok",
    status: text(body.status) || "New",
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
    : body && typeof body === "object" && Array.isArray((body as { leads?: unknown }).leads)
      ? (body as { leads: unknown[] }).leads
      : [body];

  const leads: Lead[] = [];
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const parsed = leadFrom(record as Record<string, unknown>);
    if (!parsed) {
      return NextResponse.json(
        { error: "Each lead needs name (or business)." },
        { status: 400 },
      );
    }
    leads.push(await addLead(parsed));
  }

  return NextResponse.json({ ok: true, count: leads.length, leads });
}
