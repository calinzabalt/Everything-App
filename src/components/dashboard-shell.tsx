import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden bg-zinc-50">{children}</main>
    </div>
  );
}
