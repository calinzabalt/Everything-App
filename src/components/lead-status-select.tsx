"use client";

import type { LeadStatus } from "@/data/examples";
import { LEAD_STATUS_TABS } from "@/lib/leads";

export function LeadStatusSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label="Lead status"
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation();
        const next = event.target.value as LeadStatus;
        if (next !== value) onChange(next);
      }}
      className="h-8 max-w-full rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 outline-none hover:border-zinc-300 focus:border-zinc-400 disabled:opacity-50"
    >
      {LEAD_STATUS_TABS.map((tab) => (
        <option key={tab.id} value={tab.id}>
          {tab.label}
        </option>
      ))}
    </select>
  );
}
