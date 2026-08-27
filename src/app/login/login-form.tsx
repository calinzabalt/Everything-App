"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";
import { Spinner } from "@/components/spinner";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="relative mt-8 grid gap-4">
      {pending ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <Spinner className="h-4 w-4" />
            Signing in…
          </div>
        </div>
      ) : null}
      <label className="text-sm font-medium text-zinc-700">
        Username
        <input
          name="username"
          autoComplete="username"
          required
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors duration-200 focus:border-zinc-400 disabled:opacity-60"
        />
      </label>
      <label className="text-sm font-medium text-zinc-700">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors duration-200 focus:border-zinc-400 disabled:opacity-60"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? <Spinner className="h-4 w-4 text-white" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
