import { NextResponse } from "next/server";
import { isIngestAuthorized } from "@/lib/ingest-auth";
import { listOptedOutEmails, markEmailsOptedOut } from "@/lib/store";

export const runtime = "nodejs";

function emailsFrom(body: unknown) {
  if (!body || typeof body !== "object") return [];
  const record = body as { email?: unknown; emails?: unknown };
  const values = Array.isArray(record.emails) ? record.emails : [record.email];
  return values.filter((value): value is string => typeof value === "string");
}

export async function GET(request: Request) {
  if (!isIngestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emails = await listOptedOutEmails();
  return NextResponse.json({ ok: true, count: emails.length, emails });
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

  const emails = await markEmailsOptedOut(emailsFrom(body));
  if (emails.length === 0) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: emails.length, emails });
}
