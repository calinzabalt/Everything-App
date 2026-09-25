"use client";

import { useEffect, useState } from "react";
import type { Lead, LeadStatus } from "@/data/examples";
import { formatPlace } from "@/lib/format";
import { hrefForUrl } from "@/lib/leads";
import { OUTREACH_BLOCKED_MESSAGE, outreachBlocked } from "@/lib/outreach";
import { LeadChannelBadges } from "@/components/lead-channel-badges";
import { LeadEmailPanel } from "@/components/lead-email-panel";
import { LeadStatusSelect } from "@/components/lead-status-select";

type Props = {
  lead: Lead | null;
  pending?: boolean;
  onClose: () => void;
  onStatus?: (status: LeadStatus) => void;
  onSent?: (lead: Lead) => void;
};

export function LeadDrawer({
  lead,
  pending = false,
  onClose,
  onStatus,
  onSent,
}: Props) {
  const [templateLeadId, setTemplateLeadId] = useState<string | null>(null);
  const showTemplate = Boolean(lead && templateLeadId === lead.id);

  useEffect(() => {
    if (!lead) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (showTemplate) {
        setTemplateLeadId(null);
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose, showTemplate]);

  if (!lead) return null;

  const hasEmail = Boolean(lead.email.trim());
  const optedOut = lead.emailOptOut;
  const emailBlocked = hasEmail && !optedOut && outreachBlocked(lead);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-950/40 animate-fade-in"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-zinc-200 bg-white shadow-xl animate-drawer-in ${
          showTemplate ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {showTemplate ? "Outreach email" : "Lead"}
            </p>
            <h2
              id="lead-drawer-title"
              className="mt-1 text-lg font-semibold text-zinc-950"
            >
              {lead.name}
            </h2>
            <div className="mt-2">
              <LeadChannelBadges lead={lead} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            Close
          </button>
        </header>

        {showTemplate ? (
          <LeadEmailPanel
            key={lead.id}
            lead={lead}
            disabled={pending}
            onBack={() => setTemplateLeadId(null)}
            onSent={(updated) => onSent?.(updated)}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
            <dl className="grid gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Status
                </dt>
                <dd className="mt-1.5">
                  <LeadStatusSelect
                    value={lead.status}
                    disabled={pending || !onStatus}
                    onChange={(next) => onStatus?.(next)}
                  />
                </dd>
              </div>
              <Field
                label="Location"
                value={formatPlace(lead.location, lead.country)}
              />
              <Field label="Source" value={lead.source} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {hasEmail ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sky-700 hover:text-sky-900"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {hasEmail && !emailBlocked && !optedOut ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setTemplateLeadId(lead.id)}
                    disabled={pending}
                    className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
                  >
                    View template
                  </button>
                </div>
              ) : null}
              {optedOut ? (
                <p className="text-sm leading-relaxed text-zinc-500">
                  This address opted out. We will not email them again.
                </p>
              ) : null}
              {emailBlocked ? (
                <p className="text-sm leading-relaxed text-zinc-500">
                  {OUTREACH_BLOCKED_MESSAGE}
                </p>
              ) : null}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sky-700 hover:text-sky-900"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Contact page
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {lead.url ? (
                    <a
                      href={hrefForUrl(lead.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sky-700 hover:text-sky-900"
                    >
                      {lead.url}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Note
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                  {lead.note || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-800">{value || "—"}</dd>
    </div>
  );
}
