import { discord } from "@/lib/oauth";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/session";
import { cookies } from "next/headers";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import type { OAuth2Tokens } from "arctic";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value ?? null;
  if (code === null || state === null || storedState === null) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await discord.validateAuthorizationCode(code);
  } catch {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`
    }
  });
  const discordUser = await response.json() as DiscordResponse;
  const email = discordUser.email;
  if (!email) {
    return new Response("No email found", {
      status: 400,
    });
  }

  // TODO: Replace this with your own DB query.
  const existingUser = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.providerId, discordUser.id),
        eq(users.provider, "discord"),
      ),
    )
    .limit(1);

  if (existingUser.length === 1 && existingUser[0]) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser[0].id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const sameEmailUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (sameEmailUsers.length > 0) {
    return new Response("Email already in use", {
      status: 400,
    });
  }

  const user = await db
    .insert(users)
    .values({
      provider: "discord",
      providerId: discordUser.id,
      username: discordUser.username,
      email: discordUser.email
    })
    .returning();

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user[0]!.id);
  await setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}

type DiscordResponse = {
  id: string
  username: string
  discriminator: string
  email: string
}
