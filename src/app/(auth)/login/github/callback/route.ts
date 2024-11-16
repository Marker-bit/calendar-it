import { github } from "@/lib/oauth";
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
    tokens = await github.validateAuthorizationCode(code);
  } catch {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  })
  const githubUser = (await githubUserResponse.json()) as GithubResponse;
  const githubUserId = githubUser.id;
  const githubUsername = githubUser.login;

  const emails = await emailResponse.json() as {email: string, primary: boolean, verified: boolean}[];

  const email = emails.find(email => email.primary && email.verified);
  if (!email) {
    return new Response("No verified primary emails", {
      status: 400,
    })
  }

  // TODO: Replace this with your own DB query.
  const existingUser = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.providerId, githubUserId.toString()),
        eq(users.provider, "github"),
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
    .where(eq(users.email, email.email))
    .limit(1);
  if (sameEmailUsers.length > 0) {
    return new Response("Email already in use", {
      status: 400,
    });
  }

  const user = await db
    .insert(users)
    .values({
      provider: "github",
      providerId: githubUserId.toString(),
      username: githubUsername,
      email: email.email,
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

type GithubResponse = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  notification_email?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};
