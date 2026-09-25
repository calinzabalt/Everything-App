import { NextResponse } from "next/server";
import { isIngestAuthorized } from "@/lib/ingest-auth";
import { secretsEqual } from "@/lib/secrets";
import { recordInboundReply } from "@/lib/store";

export const runtime = "nodejs";

function authorized(request: Request) {
  if (isIngestAuthorized(request)) return true;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const expected = process.env.INGEST_TOKEN ?? "";
  return Boolean(expected) && secretsEqual(token, expected);
}

function textOf(value: unknown) {
  return typeof value === "string" ? value : "";
}

function addressOf(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const address = (value as { Address?: unknown; address?: unknown }).Address;
  const lower = (value as { address?: unknown }).address;
  return textOf(address) || textOf(lower);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = Array.isArray((body as { items?: unknown })?.items)
    ? (body as { items: unknown[] }).items
    : [body];

  let handled = 0;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const from = addressOf(record.From) || textOf(record.sender);
    const subject = textOf(record.Subject) || textOf(record.subject);
    const raw =
      textOf(record.ExtractedMarkdownMessage) ||
      textOf(record.RawTextBody) ||
      textOf(record.body);
    if (!from) continue;
    await recordInboundReply({ from, subject, body: raw });
    handled += 1;
  }

  return NextResponse.json({ ok: true, count: handled });
}
