import { secretsEqual } from "@/lib/secrets";

export function ingestTokenFrom(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return (request.headers.get("x-ingest-token") ?? "").trim();
}

export function isIngestAuthorized(request: Request) {
  const expected = process.env.INGEST_TOKEN ?? "";
  if (!expected) return false;
  return secretsEqual(ingestTokenFrom(request), expected);
}
