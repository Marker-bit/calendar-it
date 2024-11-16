"use server";

import { redirect } from "next/navigation";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "./session";
import { generateState } from "arctic";
import { discord, github } from "./oauth";
import { cookies } from "next/headers";

export async function login(provider: string): Promise<ActionResult> {
  const state = generateState();
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  
  if (provider === "discord") {
    const url = discord.createAuthorizationURL(state, ["identify", "email"]);
    return redirect(url.toString());
  } else {
    const url = github.createAuthorizationURL(state, ["user:email"]);
    return redirect(url.toString());
  }
}

export async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await getCurrentSession();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/");
}

interface ActionResult {
  error: string | null;
}
