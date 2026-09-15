"use client";

import { useEffect, useState } from "react";
import {
  createLeadAction,
  listLeadsAction,
  updateLeadStatusAction,
} from "@/app/actions/records";
import { AddLeadDialog } from "@/components/add-lead-dialog";
import { LeadChannelBadges } from "@/components/lead-channel-badges";
import { LeadDrawer } from "@/components/lead-drawer";
import { LeadStatusSelect } from "@/components/lead-status-select";
import { LoadingOverlay } from "@/components/loading-screen";
import { PaginationBar } from "@/components/pagination-bar";
import { ViewToggle, type BoardView } from "@/components/view-toggle";
import type { Lead, LeadStatus } from "@/data/examples";
import { formatPlace } from "@/lib/format";
import {
  emptyLeadCounts,
  LEAD_CHANNEL_FILTERS,
  LEAD_STATUS_TABS,
  leadStatusLabel,
  type LeadChannel,
} from "@/lib/leads";
import { PAGE_SIZE } from "@/lib/paging";

export function LeadsBoard() {
  const [items, setItems] = useState<Lead[]>([]);
  const [view, setView] = useState<BoardView>("list");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [channel, setChannel] = useState<LeadChannel>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [counts, setCounts] = useState(emptyLeadCounts);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listLeadsAction(status, page, channel)
      .then((result) => {
        if (cancelled) return;
        const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
        if (page > pageCount) {
          setPage(pageCount);
          return;
        }
        setItems(result.items);
        setTotal(result.total);
        setPageSize(result.pageSize);
        setCounts(result.counts);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, channel, page, reloadKey]);

  const busy = pendingId !== null;
  const statusLabel = leadStatusLabel(status).toLowerCase();
  const channelLabel =
    LEAD_CHANNEL_FILTERS.find((item) => item.id === channel)?.label.toLowerCase() ??
    "";

  function changeStatus(next: LeadStatus) {
    setStatus(next);
    setPage(1);
  }

  function changeChannel(next: LeadChannel) {
    setChannel(next);
    setPage(1);
  }

  async function setLeadStatus(id: string, next: LeadStatus) {
    if (busy) return;
    setPendingId(id);
    try {
      const updated = await updateLeadStatusAction(id, next);
      if (!updated) return;
      setSelected((current) => (current?.id === id ? null : current));
      setReloadKey((key) => key + 1);
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
              {total} {statusLabel}
              {channel === "all" ? "" : ` · ${channelLabel}`}
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
          {LEAD_STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeStatus(tab.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
                status === tab.id
                  ? "bg-sky-600 text-white"
                  : "text-sky-800 hover:bg-sky-100"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 ${
                  status === tab.id ? "text-sky-100" : "text-sky-500"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2 inline-flex w-fit gap-0.5 rounded-lg bg-zinc-100 p-0.5">
          {LEAD_CHANNEL_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeChannel(item.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
                channel === item.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div
        key={`${status}-${channel}-${view}`}
        className="relative min-h-0 flex-1 animate-fade-in"
      >
        {view === "list" ? (
          <LeadList
            leads={items}
            status={status}
            channel={channel}
            pendingId={pendingId}
            onSelect={setSelected}
            onStatus={setLeadStatus}
          />
        ) : (
          <LeadGrid
            leads={items}
            status={status}
            channel={channel}
            pendingId={pendingId}
            onSelect={setSelected}
            onStatus={setLeadStatus}
          />
        )}
        {loading || busy ? (
          <LoadingOverlay
            label={loading ? "Loading leads…" : "Updating lead…"}
          />
        ) : null}
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPage={setPage}
        disabled={loading || busy}
      />

      <AddLeadDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={async (lead) => {
          await createLeadAction(lead);
          setStatus("new");
          setChannel("all");
          setPage(1);
          setReloadKey((key) => key + 1);
          setAddOpen(false);
        }}
      />
      <LeadDrawer
        lead={selected}
        pending={selected ? pendingId === selected.id : false}
        onClose={() => setSelected(null)}
        onStatus={(next) => selected && setLeadStatus(selected.id, next)}
        onSent={() => {
          setSelected(null);
          setReloadKey((key) => key + 1);
        }}
      />
    </div>
  );
}

function LeadList({
  leads,
  status,
  channel,
  pendingId,
  onSelect,
  onStatus,
}: {
  leads: Lead[];
  status: LeadStatus;
  channel: LeadChannel;
  pendingId: string | null;
  onSelect: (lead: Lead) => void;
  onStatus: (id: string, next: LeadStatus) => void;
}) {
  return (
    <div className="h-full overflow-auto px-8 pb-8">
      {leads.length === 0 ? (
        <EmptyState status={status} channel={channel} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_128px] gap-4 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            <span>Business</span>
            <span>Location</span>
            <span>Note</span>
            <span>Status</span>
          </div>
          <ul>
            {leads.map((lead) => (
              <li
                key={lead.id}
                className={`grid min-h-16 grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_128px] items-center gap-4 border-b border-zinc-100 px-4 py-2 last:border-b-0 transition-colors duration-200 hover:bg-zinc-50 animate-rise-in ${
                  pendingId === lead.id ? "opacity-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {lead.name}
                  </p>
                  <div className="mt-1">
                    <LeadChannelBadges lead={lead} />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="truncate text-left text-sm text-zinc-600"
                >
                  {formatPlace(lead.location, lead.country)}
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="truncate text-left text-sm text-zinc-500"
                >
                  {lead.note}
                </button>
                <LeadStatusSelect
                  value={lead.status}
                  disabled={pendingId === lead.id}
                  onChange={(next) => onStatus(lead.id, next)}
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
  status,
  channel,
  pendingId,
  onSelect,
  onStatus,
}: {
  leads: Lead[];
  status: LeadStatus;
  channel: LeadChannel;
  pendingId: string | null;
  onSelect: (lead: Lead) => void;
  onStatus: (id: string, next: LeadStatus) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="h-full overflow-auto px-8 pb-8">
        <EmptyState status={status} channel={channel} />
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
                <h2 className="truncate text-sm font-medium text-zinc-900">
                  {lead.name}
                </h2>
                <div className="mt-1.5">
                  <LeadChannelBadges lead={lead} />
                </div>
                <p className="mt-1.5 truncate text-sm text-zinc-500">
                  {formatPlace(lead.location, lead.country)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                  {lead.note}
                </p>
              </button>
              <div className="mt-3">
                <LeadStatusSelect
                  value={lead.status}
                  disabled={pendingId === lead.id}
                  onChange={(next) => onStatus(lead.id, next)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  status,
  channel,
}: {
  status?: LeadStatus;
  channel?: LeadChannel;
}) {
  const statusLabel = status ? leadStatusLabel(status).toLowerCase() : "leads";
  const channelLabel =
    channel && channel !== "all"
      ? LEAD_CHANNEL_FILTERS.find((item) => item.id === channel)?.label.toLowerCase()
      : null;

  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500 animate-fade-in">
      {channelLabel
        ? `No ${statusLabel} with ${channelLabel}`
        : `No ${statusLabel} yet`}
    </div>
  );
}
