const BLOCKED_PLACES = new Set([
  "austria",
  "at",
  "belgium",
  "be",
  "bulgaria",
  "bg",
  "croatia",
  "hr",
  "cyprus",
  "cy",
  "czech republic",
  "czechia",
  "cz",
  "denmark",
  "dk",
  "estonia",
  "ee",
  "finland",
  "fi",
  "france",
  "fr",
  "germany",
  "deutschland",
  "de",
  "greece",
  "gr",
  "hungary",
  "hu",
  "ireland",
  "ie",
  "italy",
  "italia",
  "it",
  "latvia",
  "lv",
  "lithuania",
  "lt",
  "luxembourg",
  "lu",
  "malta",
  "mt",
  "netherlands",
  "the netherlands",
  "holland",
  "nl",
  "poland",
  "pl",
  "portugal",
  "pt",
  "romania",
  "ro",
  "slovakia",
  "sk",
  "slovenia",
  "si",
  "spain",
  "es",
  "sweden",
  "se",
  "iceland",
  "is",
  "liechtenstein",
  "li",
  "norway",
  "no",
]);

const BLOCKED_EMAIL_TLDS = [
  ".at",
  ".be",
  ".bg",
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
  "Cold email is off for EU and EEA leads, including Germany. UK, US, and Canada can still be emailed.";

function placeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function mentionsBlockedPlace(value: string) {
  const key = placeKey(value);
  if (!key) return false;
  if (BLOCKED_PLACES.has(key)) return true;
  return key.split(/[,/|]/).some((part) => BLOCKED_PLACES.has(part.trim()));
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
  return (
    mentionsBlockedPlace(lead.country ?? "") ||
    mentionsBlockedPlace(lead.location ?? "") ||
    hasBlockedEmailDomain(lead.email ?? "")
  );
}
