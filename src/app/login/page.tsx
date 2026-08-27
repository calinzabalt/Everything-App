import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm animate-dialog-in">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white">
            EA
          </span>
          <div>
            <h1 className="text-lg font-semibold text-zinc-950">Everything</h1>
            <p className="text-sm text-zinc-500">Sign in</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
