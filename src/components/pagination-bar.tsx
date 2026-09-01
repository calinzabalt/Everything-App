"use client";

export function PaginationBar({
  page,
  pageSize,
  total,
  onPage,
  disabled = false,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  if (total <= pageSize) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-8 pb-6 pt-3">
      <p className="text-sm text-zinc-500">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
          className="h-9 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-16 px-2 text-center text-sm text-zinc-500">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={disabled || page >= pageCount}
          onClick={() => onPage(page + 1)}
          className="h-9 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
