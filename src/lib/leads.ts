import type { Lead, LeadStatus } from "@/data/examples";

export const LEAD_STATUS_TABS: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "lead", label: "Lead" },
  { id: "won", label: "Won" },
  { id: "closed", label: "Closed" },
  { id: "deleted", label: "Deleted" },
];

export type LeadChannel = "all" | "email" | "phone" | "url";

export const LEAD_CHANNEL_FILTERS: { id: LeadChannel; label: string }[] = [
  { id: "all", label: "All" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "url", label: "Contact page" },
];

export const emptyLeadCounts: Record<LeadStatus, number> = {
  new: 0,
  contacted: 0,
  lead: 0,
  won: 0,
  closed: 0,
  deleted: 0,
};

export function parseLeadStatus(status: string): LeadStatus {
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "emailed" || key === "followed_up" || key === "contacted") {
    return "contacted";
  }
  if (key === "replied" || key === "lead") return "lead";
  if (key === "won" || key === "closed" || key === "deleted") return key;
  return "new";
}

export function leadStatusLabel(status: LeadStatus) {
  return LEAD_STATUS_TABS.find((tab) => tab.id === status)?.label ?? status;
}

export function leadContactChannels(lead: Pick<Lead, "email" | "phone" | "url">) {
  const channels: { id: Exclude<LeadChannel, "all">; label: string }[] = [];
  if (lead.email.trim()) channels.push({ id: "email", label: "Email" });
  if (lead.phone.trim()) channels.push({ id: "phone", label: "Phone" });
  if (lead.url.trim()) channels.push({ id: "url", label: "Page" });
  return channels;
}

export function hrefForUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
