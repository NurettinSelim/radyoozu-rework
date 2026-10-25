import "server-only";

import { SITE_URL } from "@/lib/seo";

// Minimum scope to read the account's playlists.
export const SPOTIFY_SCOPE = "playlist-read-private";
export const SPOTIFY_STATE_COOKIE = "spotify_oauth_state";

/**
 * Build the absolute redirect URI for the OAuth callback. Must be
 * byte-identical in /connect and /callback AND registered verbatim in the
 * Spotify app dashboard. Accepts a Headers object so route handlers
 * (req.headers) and Server Components (await headers()) compute the same
 * value.
 *
 * On production the canonical host (SITE_URL) wins — deriving from request
 * headers would vary per deployment domain (www vs vercel.app) and fail
 * Spotify's exact-match registration check. Headers are only honored for
 * loopback development (Spotify requires http://127.0.0.1 / [::1], and
 * rejects "localhost").
 */
export function callbackUri(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "";
  const isLoopback =
    host.startsWith("127.0.0.1") || host.startsWith("[::1]") || host.startsWith("localhost");
  if (!isLoopback) return `${SITE_URL}/api/spotify/callback`;
  const proto = headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/api/spotify/callback`;
}

/** Exchange an authorization code for tokens. Returns the refresh token or null. */
export async function exchangeCodeForRefreshToken(
  code: string,
  redirectUri: string,
): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: { refresh_token?: string } = await res.json();
    return data.refresh_token ?? null;
  } catch {
    return null;
  }
}
