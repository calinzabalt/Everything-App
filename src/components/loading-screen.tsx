import { Spinner } from "@/components/spinner";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
        EA
      </div>
      <Spinner className="h-5 w-5 text-zinc-900" />
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}

export function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-50/80 backdrop-blur-[2px] animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg">
        <Spinner className="h-4 w-4 text-zinc-900" />
        <p className="text-sm font-medium text-zinc-700">{label}</p>
      </div>
    </div>
  );
}
