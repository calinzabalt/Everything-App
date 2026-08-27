"use client";

import { useEffect } from "react";
import type { Lead } from "@/data/examples";
import { formatPlace } from "@/lib/format";
import { Spinner } from "@/components/spinner";

type Props = {
  lead: Lead | null;
  pending?: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
};

export function LeadDrawer({
  lead,
  pending = false,
  onClose,
  onDelete,
  onRestore,
}: Props) {
  useEffect(() => {
    if (!lead) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  if (!lead) return null;

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
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl animate-drawer-in"
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Lead
            </p>
            <h2
              id="lead-drawer-title"
              className="mt-1 text-lg font-semibold text-zinc-950"
            >
              {lead.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {lead.status === "Deleted" ? (
              <button
                type="button"
                onClick={onRestore}
                disabled={pending}
                className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
              >
                {pending ? <Spinner className="h-4 w-4" /> : "Restore"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
              >
                {pending ? <Spinner className="h-4 w-4" /> : "Delete"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Close
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
          <dl className="grid gap-4">
            <Field label="Status" value={lead.status} />
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
                {lead.email ? (
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
                Note
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                {lead.note || "—"}
              </dd>
            </div>
          </dl>
        </div>
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
