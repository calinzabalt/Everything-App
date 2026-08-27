"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/login/actions";
import { Spinner } from "@/components/spinner";

export function SignOutButton({ collapsed }: { collapsed: boolean }) {
  return (
    <form action={logout}>
      <SignOutSubmit collapsed={collapsed} />
    </form>
  );
}

function SignOutSubmit({ collapsed }: { collapsed: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      title="Sign out"
      disabled={pending}
      className={`flex w-full items-center rounded-xl py-2.5 text-sm text-zinc-400 transition-colors duration-200 hover:bg-white/5 hover:text-white disabled:opacity-60 ${
        collapsed ? "justify-center" : "gap-3 px-3"
      }`}
    >
      {pending ? <Spinner className="h-[18px] w-[18px] text-zinc-300" /> : <SignOutIcon />}
      {!collapsed && (pending ? "Signing out…" : "Sign out")}
    </button>
  );
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 12h10M11 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
