"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, secretsEqual } from "@/lib/auth";

export async function login(_prev: string | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const expectedUser = process.env.AUTH_USERNAME ?? "";
  const expectedPass = process.env.AUTH_PASSWORD ?? "";

  if (
    !expectedUser ||
    !expectedPass ||
    !secretsEqual(username, expectedUser) ||
    !secretsEqual(password, expectedPass)
  ) {
    return "Invalid username or password.";
  }

  try {
    await createSession(username);
  } catch {
    return "Auth is not configured. Set AUTH_SECRET in .env.";
  }
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
