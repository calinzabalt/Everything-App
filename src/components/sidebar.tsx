"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/jobs", label: "Job Finder", icon: BriefcaseIcon },
  { href: "/leads", label: "Lead Finder", icon: TargetIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-200 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <Link
        href="/dashboard"
        title="Dashboard"
        className={`flex items-center py-5 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold tracking-tight text-zinc-950">
          EA
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-white">
              Everything
            </p>
            <p className="text-xs text-zinc-500">Dashboard</p>
          </div>
        )}
      </Link>

      <nav className={`flex flex-1 flex-col gap-1 py-2 ${collapsed ? "px-2" : "px-3"}`}>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center rounded-xl text-sm font-medium transition-colors duration-200 ${
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon />
              {!collapsed && item.label}
            </Link>
          );
        })}

        <span
          title="Clients"
          className={`mt-1 flex items-center rounded-xl text-sm text-zinc-600 ${
            collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
          }`}
        >
          <span className="flex items-center gap-3">
            <IdCardIcon />
            {!collapsed && "Clients"}
          </span>
          {!collapsed && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Later
            </span>
          )}
        </span>
      </nav>

      <div className={`border-t border-zinc-800 p-2 ${collapsed ? "" : "px-3"}`}>
        <SignOutButton collapsed={collapsed} />
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Open menu" : "Close menu"}
          aria-label={collapsed ? "Open menu" : "Close menu"}
          className={`flex w-full items-center rounded-xl py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white ${
            collapsed ? "justify-center" : "gap-3 px-3"
          }`}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          {!collapsed && "Close"}
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M4 13h16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M13.5 10.5h4M13.5 13.5h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.5 6 9 12l5.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.5 6 15 12l-5.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
