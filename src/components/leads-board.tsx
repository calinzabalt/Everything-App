"use client";

import { useMemo, useState } from "react";
import {
  createLeadAction,
  updateLeadStatusAction,
} from "@/app/actions/records";
import { AddLeadDialog } from "@/components/add-lead-dialog";
import { LeadDrawer } from "@/components/lead-drawer";
import { LoadingOverlay } from "@/components/loading-screen";
import { ViewToggle, type BoardView } from "@/components/view-toggle";
import type { Lead } from "@/data/examples";
import { formatPlace } from "@/lib/format";

type LeadTab = "open" | "deleted";

const tabs: { id: LeadTab; label: string }[] = [
  { id: "open", label: "Leads" },
  { id: "deleted", label: "Deleted" },
];

export function LeadsBoard({ leads }: { leads: Lead[] }) {
  const [items, setItems] = useState(leads);
  const [view, setView] = useState<BoardView>("list");
  const [tab, setTab] = useState<LeadTab>("open");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      items.filter((lead) =>
        tab === "deleted" ? lead.status === "Deleted" : lead.status !== "Deleted",
      ),
    [items, tab],
  );
  const counts = useMemo(
    () => ({
      open: items.filter((lead) => lead.status !== "Deleted").length,
      deleted: items.filter((lead) => lead.status === "Deleted").length,
    }),
    [items],
  );
  const busy = pendingId !== null;

  async function setLeadStatus(id: string, status: string) {
    if (busy) return;
    setPendingId(id);
    try {
      const updated = await updateLeadStatusAction(id, status);
      if (!updated) return;
      setItems((current) =>
        current.map((lead) => (lead.id === id ? updated : lead)),
      );
      setSelected(null);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <header className="shrink-0 px-8 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Lead Finder
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {visible.length} {tab === "deleted" ? "deleted" : "saved"} leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={setView} />
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              disabled={busy}
              className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
            >
              Add lead
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex w-fit gap-0.5 rounded-lg bg-sky-50 p-0.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
                tab === item.id
                  ? "bg-sky-600 text-white"
                  : "text-sky-800 hover:bg-sky-100"
              }`}
            >
              {item.label}
              <span
                className={`ml-1.5 ${
                  tab === item.id ? "text-sky-100" : "text-sky-500"
                }`}
              >
                {counts[item.id]}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div key={`${tab}-${view}`} className="relative min-h-0 flex-1 animate-fade-in">
        {view === "list" ? (
          <LeadList
            leads={visible}
            tab={tab}
            pendingId={pendingId}
            onSelect={setSelected}
            onStatus={setLeadStatus}
          />
        ) : (
          <LeadGrid
            leads={visible}
            tab={tab}
            pendingId={pendingId}
            onSelect={setSelected}
            onStatus={setLeadStatus}
          />
        )}
        {busy ? (
          <LoadingOverlay
            label={tab === "deleted" ? "Restoring lead…" : "Deleting lead…"}
          />
        ) : null}
      </div>

      <AddLeadDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={async (lead) => {
          const saved = await createLeadAction(lead);
          setItems((current) => [
            saved,
            ...current.filter((item) => item.id !== saved.id),
          ]);
          setTab("open");
          setAddOpen(false);
        }}
      />
      <LeadDrawer
        lead={selected}
        pending={selected ? pendingId === selected.id : false}
        onClose={() => setSelected(null)}
        onDelete={() => selected && setLeadStatus(selected.id, "Deleted")}
        onRestore={() => selected && setLeadStatus(selected.id, "New")}
      />
    </div>
  );
}

function LeadList({
  leads,
  tab,
  pendingId,
  onSelect,
  onStatus,
}: {
  leads: Lead[];
  tab: LeadTab;
  pendingId: string | null;
  onSelect: (lead: Lead) => void;
  onStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="h-full overflow-auto px-8 pb-8">
      {leads.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_90px_88px] gap-4 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            <span>Business</span>
            <span>Location</span>
            <span>Note</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <ul>
            {leads.map((lead) => (
              <li
                key={lead.id}
                className={`grid h-14 grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_90px_88px] items-center gap-4 border-b border-zinc-100 px-4 last:border-b-0 transition-colors duration-200 hover:bg-zinc-50 animate-rise-in ${
                  pendingId === lead.id ? "opacity-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="col-span-4 grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_90px] items-center gap-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {lead.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {[lead.email, lead.phone, lead.source]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="truncate text-sm text-zinc-600">
                    {formatPlace(lead.location, lead.country)}
                  </p>
                  <p className="truncate text-sm text-zinc-500">{lead.note}</p>
                  <span className="text-xs font-medium text-zinc-500">
                    {lead.status}
                  </span>
                </button>
                <LeadAction
                  lead={lead}
                  onStatus={onStatus}
                  align="end"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LeadGrid({
  leads,
  tab,
  pendingId,
  onSelect,
  onStatus,
}: {
  leads: Lead[];
  tab: LeadTab;
  pendingId: string | null;
  onSelect: (lead: Lead) => void;
  onStatus: (id: string, status: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="h-full overflow-auto px-8 pb-8">
        <EmptyState tab={tab} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto px-8 pb-8">
      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className={`animate-rise-in ${pendingId === lead.id ? "opacity-50" : ""}`}
          >
            <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300">
              <button
                type="button"
                onClick={() => onSelect(lead)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="truncate text-sm font-medium text-zinc-900">
                    {lead.name}
                  </h2>
                  <span className="shrink-0 text-xs font-medium text-zinc-400">
                    {lead.status}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-sm text-zinc-500">
                  {formatPlace(lead.location, lead.country)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                  {lead.note}
                </p>
                <p className="mt-2 truncate text-xs text-zinc-400">
                  {[lead.email, lead.phone, lead.source]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </button>
              <div className="mt-3">
                <LeadAction lead={lead} onStatus={onStatus} align="start" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadAction({
  lead,
  onStatus,
  align = "end",
}: {
  lead: Lead;
  onStatus: (id: string, status: string) => void;
  align?: "start" | "end";
}) {
  const deleted = lead.status === "Deleted";

  return (
    <div className={`flex ${align === "end" ? "justify-end" : "justify-start"}`}>
      <button
        type="button"
        onClick={() => onStatus(lead.id, deleted ? "New" : "Deleted")}
        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700"
      >
        {deleted ? "Restore" : "Delete"}
      </button>
    </div>
  );
}

function EmptyState({ tab }: { tab: LeadTab }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500 animate-fade-in">
      {tab === "deleted" ? "No deleted leads" : "No leads yet"}
    </div>
  );
}
