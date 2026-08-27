import { cookies } from "next/headers";
import { secretsEqual } from "@/lib/secrets";
import {
  readSession,
  SESSION_COOKIE,
  SESSION_DAYS,
  signSessionToken,
} from "@/lib/session";

export { secretsEqual };

export async function createSession(username: string) {
  const token = await signSessionToken(username);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSession() {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
