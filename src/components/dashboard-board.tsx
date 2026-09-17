"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStatsAction } from "@/app/actions/records";
import type { DashboardStats } from "@/lib/store";

export function DashboardBoard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboardStatsAction()
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full overflow-auto px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Snapshot of jobs, leads, and clients.
        </p>
      </header>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {stats ? (
            <>
              <ReportCard
                title="Job Finder"
                href="/jobs"
                linkLabel="Open jobs"
                stats={[
                  { label: "Saved", value: stats.jobs.total },
                  { label: "Not applied", value: stats.jobs.not_applied },
                  { label: "Applied", value: stats.jobs.applied },
                  { label: "Deleted", value: stats.jobs.deleted },
                ]}
                breakdown={stats.jobs.byCountry}
                breakdownLabel="By country"
              />
              <ReportCard
                title="Lead Finder"
                href="/leads"
                linkLabel="Open leads"
                stats={[
                  { label: "Saved", value: stats.leads.saved },
                  { label: "New", value: stats.leads.new },
                  { label: "Contacted", value: stats.leads.contacted },
                  { label: "Lead", value: stats.leads.lead },
                ]}
                breakdown={stats.leads.bySource}
                breakdownLabel="By source"
              />
              <ReportCard
                title="Clients"
                stats={[
                  { label: "Active", value: 0 },
                  { label: "In progress", value: 0 },
                  { label: "Not active", value: 0 },
                ]}
                note="Reports will show here when Clients is built."
              />
            </>
          ) : (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-28 animate-pulse rounded-md bg-zinc-200" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-zinc-100" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl bg-zinc-50 px-3 py-3">
            <div className="h-3 w-14 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-7 w-10 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-6 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportCard({
  title,
  href,
  linkLabel,
  stats,
  breakdown,
  breakdownLabel,
  note,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  stats: { label: string; value: number }[];
  breakdown?: Record<string, number>;
  breakdownLabel?: string;
  note?: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 animate-rise-in">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="text-sm font-medium text-sky-700 hover:text-sky-900"
          >
            {linkLabel}
          </Link>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Later
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-zinc-50 px-3 py-3">
            <dt className="text-xs text-zinc-500">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {breakdown && breakdownLabel ? (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {breakdownLabel}
          </p>
          <ul className="mt-2 space-y-1.5">
            {Object.entries(breakdown).map(([label, value]) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 text-sm text-zinc-600"
              >
                <span className="min-w-0 truncate" title={label}>
                  {label}
                </span>
                <span className="shrink-0 font-medium text-zinc-900">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {note ? <p className="mt-4 text-sm text-zinc-500">{note}</p> : null}
    </section>
  );
}
