import type { ReactNode } from "react";

export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="h-full animate-page-in">{children}</div>;
}
