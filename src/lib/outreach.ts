const ALLOWED_PLACES = new Set([
  "uk",
  "u k",
  "gb",
  "united kingdom",
  "great britain",
  "britain",
  "england",
  "scotland",
  "wales",
  "northern ireland",
  "us",
  "u s",
  "usa",
  "u s a",
  "united states",
  "united states of america",
]);

const BLOCKED_EMAIL_TLDS = [
  ".at",
  ".be",
  ".bg",
  ".ca",
  ".hr",
  ".cy",
  ".cz",
  ".dk",
  ".ee",
  ".fi",
  ".fr",
  ".de",
  ".gr",
  ".hu",
  ".ie",
  ".it",
  ".lv",
  ".lt",
  ".lu",
  ".mt",
  ".nl",
  ".pl",
  ".pt",
  ".ro",
  ".sk",
  ".si",
  ".es",
  ".se",
  ".is",
  ".li",
  ".no",
  ".eu",
];

export const OUTREACH_BLOCKED_MESSAGE =
  "Cold email is only for UK and US leads.";

function placeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function isAllowedPlace(value: string) {
  const key = placeKey(value);
  if (!key) return false;
  if (ALLOWED_PLACES.has(key)) return true;
  return key.split(/[,/|]/).some((part) => ALLOWED_PLACES.has(part.trim()));
}

function hasBlockedEmailDomain(email: string) {
  const domain = email.trim().toLowerCase().split("@").at(1) ?? "";
  if (!domain) return false;
  return BLOCKED_EMAIL_TLDS.some(
    (tld) => domain === tld.slice(1) || domain.endsWith(tld),
  );
}

export function outreachBlocked(lead: {
  country?: string | null;
  location?: string | null;
  email?: string | null;
}) {
  if (hasBlockedEmailDomain(lead.email ?? "")) return true;
  const country = lead.country?.trim() ?? "";
  if (country) return !isAllowedPlace(country);
  const location = lead.location?.trim() ?? "";
  if (location) return !isAllowedPlace(location);
  return true;
}
