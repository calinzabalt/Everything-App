import Link from "next/link";
import { getDashboardStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { jobs, leads } = await getDashboardStats();

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

      <div className="grid gap-4 lg:grid-cols-3">
        <ReportCard
          title="Job Finder"
          href="/jobs"
          linkLabel="Open jobs"
          stats={[
            { label: "Saved", value: jobs.total },
            { label: "Not applied", value: jobs.not_applied },
            { label: "Applied", value: jobs.applied },
            { label: "Deleted", value: jobs.deleted },
          ]}
          breakdown={jobs.byCountry}
          breakdownLabel="By country"
        />

        <ReportCard
          title="Lead Finder"
          href="/leads"
          linkLabel="Open leads"
          stats={[
            { label: "Saved", value: leads.saved },
            { label: "New", value: leads.new },
            { label: "Contacted", value: leads.contacted },
            { label: "Lead", value: leads.lead },
          ]}
          breakdown={leads.bySource}
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
      </div>
    </div>
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
                className="flex items-center justify-between text-sm text-zinc-600"
              >
                <span>{label}</span>
                <span className="font-medium text-zinc-900">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {note ? <p className="mt-4 text-sm text-zinc-500">{note}</p> : null}
    </section>
  );
}
