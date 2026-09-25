"use client";

import { useEffect, useState } from "react";
import { getOutreachReportAction } from "@/app/actions/records";
import type { SourceReport } from "@/lib/store";

export function ReportsBoard() {
  const [rows, setRows] = useState<SourceReport[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOutreachReportAction()
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load reports.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full overflow-auto px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Reports
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Sent, replied, and won for each lead source.
        </p>
      </header>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!rows && !error ? (
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
      ) : null}
      {rows && rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No outreach yet.</p>
      ) : null}
      {rows && rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_80px_80px_80px] gap-4 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            <span>Source</span>
            <span>Sent</span>
            <span>Replied</span>
            <span>Won</span>
          </div>
          <ul>
            {rows.map((row) => (
              <li
                key={row.source}
                className="grid grid-cols-[minmax(0,1fr)_80px_80px_80px] gap-4 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0"
              >
                <span className="truncate text-zinc-800">{row.source}</span>
                <span className="font-medium text-zinc-950">{row.sent}</span>
                <span className="font-medium text-zinc-950">{row.replied}</span>
                <span className="font-medium text-zinc-950">{row.won}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
