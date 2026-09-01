"use client";

import { useEffect, useState } from "react";
import {
  createJobAction,
  listJobsAction,
  updateJobStatusAction,
} from "@/app/actions/records";
import { AddJobDialog } from "@/components/add-job-dialog";
import { LoadingOverlay } from "@/components/loading-screen";
import { PaginationBar } from "@/components/pagination-bar";
import { Spinner } from "@/components/spinner";
import { ViewToggle, type BoardView } from "@/components/view-toggle";
import type { Job, JobStatus } from "@/data/examples";
import { formatPlace } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/paging";

const statusTabs: { id: JobStatus; label: string }[] = [
  { id: "not_applied", label: "Not applied" },
  { id: "applied", label: "Applied" },
  { id: "deleted", label: "Deleted" },
];

export function JobsBoard() {
  const [items, setItems] = useState<Job[]>([]);
  const [status, setStatus] = useState<JobStatus>("not_applied");
  const [view, setView] = useState<BoardView>("list");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [counts, setCounts] = useState<Record<JobStatus, number>>({
    not_applied: 0,
    applied: 0,
    deleted: 0,
  });
  const [addOpen, setAddOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listJobsAction(status, page)
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
  }, [status, page, reloadKey]);

  const busy = pendingId !== null;

  function changeStatus(next: JobStatus) {
    setStatus(next);
    setPage(1);
  }

  async function setJobStatus(id: string, next: JobStatus) {
    if (busy) return;
    setPendingId(id);
    try {
      const updated = await updateJobStatusAction(id, next);
      if (!updated) return;
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
              Job Finder
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {total} {statusTabs.find((tab) => tab.id === status)?.label.toLowerCase()}
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
              Add job
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex w-fit gap-0.5 rounded-lg bg-sky-50 p-0.5">
          {statusTabs.map((tab) => (
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
      </header>

      <div key={`${status}-${view}`} className="relative min-h-0 flex-1 animate-fade-in">
        {view === "list" ? (
          <JobList
            jobs={items}
            status={status}
            pendingId={pendingId}
            onStatus={setJobStatus}
          />
        ) : (
          <JobGrid
            jobs={items}
            status={status}
            pendingId={pendingId}
            onStatus={setJobStatus}
          />
        )}
        {loading || busy ? (
          <LoadingOverlay label={loading ? "Loading jobs…" : "Updating job…"} />
        ) : null}
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPage={setPage}
        disabled={loading || busy}
      />

      <AddJobDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={async (job) => {
          await createJobAction(job);
          setStatus("not_applied");
          setPage(1);
          setReloadKey((key) => key + 1);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

function JobList({
  jobs,
  status,
  pendingId,
  onStatus,
}: {
  jobs: Job[];
  status: JobStatus;
  pendingId: string | null;
  onStatus: (id: string, next: JobStatus) => void;
}) {
  return (
    <div className="h-full overflow-auto px-8 pb-8">
      {jobs.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1fr)_88px_220px] gap-4 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            <span>Role</span>
            <span>Company</span>
            <span>Location</span>
            <span>Level</span>
            <span className="text-right">Actions</span>
          </div>
          <ul>
            {jobs.map((job) => (
              <li
                key={job.id}
                className={`grid h-14 grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1fr)_88px_220px] items-center gap-4 border-b border-zinc-100 px-4 last:border-b-0 transition-colors duration-200 hover:bg-zinc-50 animate-rise-in ${
                  pendingId === job.id ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {job.title}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {job.skills.join(" · ")}
                  </p>
                </div>
                <p className="truncate text-sm text-zinc-600">{job.company}</p>
                <p className="truncate text-sm text-zinc-600">
                  {formatPlace(job.location, job.country)}
                </p>
                <span className="text-xs font-medium text-zinc-500">
                  {job.level}
                </span>
                <JobActions
                  job={job}
                  pending={pendingId === job.id}
                  onStatus={onStatus}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JobGrid({
  jobs,
  status,
  pendingId,
  onStatus,
}: {
  jobs: Job[];
  status: JobStatus;
  pendingId: string | null;
  onStatus: (id: string, next: JobStatus) => void;
}) {
  return (
    <div className="h-full overflow-auto px-8 pb-8">
      {jobs.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className={`rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300 animate-rise-in ${
                pendingId === job.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900">
                  {job.title}
                </h2>
                <span className="shrink-0 text-xs font-medium text-zinc-400">
                  {job.level}
                </span>
              </div>
              <p className="mt-1.5 truncate text-sm text-zinc-500">
                {job.company}
              </p>
              <p className="truncate text-sm text-zinc-400">
                {formatPlace(job.location, job.country)}
              </p>
              <p className="mt-2 truncate text-xs text-zinc-400">
                {job.skills.join(" · ")}
              </p>
              <div className="mt-3">
                <JobActions
                  job={job}
                  pending={pendingId === job.id}
                  onStatus={onStatus}
                  align="start"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function JobActions({
  job,
  pending,
  onStatus,
  align = "end",
}: {
  job: Job;
  pending: boolean;
  onStatus: (id: string, next: JobStatus) => void;
  align?: "start" | "end";
}) {
  if (pending) {
    return (
      <div className={`flex ${align === "end" ? "justify-end" : "justify-start"}`}>
        <Spinner className="h-4 w-4 text-zinc-500" />
      </div>
    );
  }

  return (
    <div className={`flex gap-1.5 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {job.status !== "deleted" && (
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
        >
          Check
        </a>
      )}

      {job.status === "not_applied" && (
        <>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onStatus(job.id, "applied")}
            className="rounded-lg bg-zinc-950 px-2.5 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800"
          >
            Apply
          </a>
          <button
            type="button"
            onClick={() => onStatus(job.id, "deleted")}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700"
          >
            Delete
          </button>
        </>
      )}

      {job.status === "applied" && (
        <button
          type="button"
          onClick={() => onStatus(job.id, "deleted")}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700"
        >
          Delete
        </button>
      )}

      {job.status === "deleted" && (
        <button
          type="button"
          onClick={() => onStatus(job.id, "not_applied")}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
        >
          Restore
        </button>
      )}
    </div>
  );
}

function EmptyState({ status }: { status: JobStatus }) {
  const label =
    status === "applied"
      ? "No applied jobs"
      : status === "deleted"
        ? "No deleted jobs"
        : "No jobs to apply to";

  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500 animate-fade-in">
      {label}
    </div>
  );
}
