"use client";

export type BoardView = "list" | "grid";

export function ViewToggle({
  view,
  onChange,
}: {
  view: BoardView;
  onChange: (view: BoardView) => void;
}) {
  return (
    <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
      <button
        type="button"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
          view === "list"
            ? "bg-zinc-900 text-white"
            : "text-zinc-500 hover:text-zinc-900"
        }`}
      >
        <ListIcon />
        List
      </button>
      <button
        type="button"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
          view === "grid"
            ? "bg-zinc-900 text-white"
            : "text-zinc-500 hover:text-zinc-900"
        }`}
      >
        <GridIcon />
        Grid
      </button>
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 3.5h10M2 7h10M2 10.5h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="1.5" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="8" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="8" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
