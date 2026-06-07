import "server-only";

import { readRefreshToken } from "@/lib/spotify-auth-store";

// Spotify Web API client.
// Listing an account's playlists is user-specific data, so it requires a user
// token (Authorization Code flow), NOT Client Credentials. We hold a long-lived
// refresh token for the Radyo Özü account (set via the admin "Connect Spotify"
// flow, or scripts/spotify-auth.mjs) and exchange it for a short-lived access
// token on the server at render time.
// Docs: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string | null;
  trackCount: number;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (m) => ENTITIES[m] ?? m);
}

/** Exchange the stored refresh token for a short-lived access token. */
async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = await readRefreshToken();
  if (!id || !secret || !refreshToken) return null;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      // Access tokens live ~1h; this POST is uncached and runs only at
      // build / ISR revalidation, not per visitor.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: { access_token?: string } = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * GET against the Spotify API with bounded retry that honors HTTP 429
 * Retry-After, per Spotify's rate-limit guidance. Returns the Response (caller
 * checks res.ok) or null on network failure / exhausted retries.
 */
async function spotifyGet(
  url: string,
  token: string,
  attempt = 0,
): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600, tags: ["spotify-playlists"] },
    });

    if (res.status === 429 && attempt < 2) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "1");
      const waitMs = Math.min(Number.isFinite(retryAfter) ? retryAfter : 1, 10) * 1000;
      await new Promise((r) => setTimeout(r, waitMs * (attempt + 1)));
      return spotifyGet(url, token, attempt + 1);
    }
    return res;
  } catch {
    return null;
  }
}

type SpotifyApiPlaylist = {
  id: string;
  name: string;
  description: string | null;
  external_urls?: { spotify?: string };
  images?: Array<{ url: string }> | null;
  tracks?: { total?: number };
};

/**
 * Fetch the Radyo Özü account's playlists (newest the account exposes first).
 * Returns [] when the integration isn't configured or the API is unreachable,
 * so the page can fall back to a static design without error handling.
 */
export async function getSpotifyPlaylists(limit = 12): Promise<SpotifyPlaylist[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await spotifyGet(`${API_BASE}/me/playlists?limit=${limit}`, token);
  if (!res || !res.ok) return [];

  const data: { items?: Array<SpotifyApiPlaylist | null> } = await res.json();
  return (data.items ?? [])
    .filter((p): p is SpotifyApiPlaylist => Boolean(p))
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: decodeEntities(p.description ?? ""),
      url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
      imageUrl: p.images?.[0]?.url ?? null,
      trackCount: p.tracks?.total ?? 0,
    }));
}

export type SpotifyDiagnostics =
  | { state: "disconnected" }
  | { state: "token_error" }
  | { state: "ok"; account: string; total: number }
  | { state: "api_error"; status: number; message: string };

/**
 * Live (uncached) probe of the connection for the admin page. Distinguishes the
 * states that {@link getSpotifyPlaylists} collapses into an empty list — most
 * importantly the Development-Mode 403 ("user not registered for this
 * application"), which otherwise looks like "no playlists found".
 */
export async function getSpotifyDiagnostics(): Promise<SpotifyDiagnostics> {
  const token = await getAccessToken();
  if (!token) {
    return (await readRefreshToken())
      ? { state: "token_error" }
      : { state: "disconnected" };
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/me/playlists?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { state: "api_error", status: 0, message: "Ağ hatası" };
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body: { error?: { message?: string } } = await res.json();
      message = body.error?.message ?? message;
    } catch {
      /* non-JSON body */
    }
    return { state: "api_error", status: res.status, message };
  }

  const data: { total?: number } = await res.json();
  let account = "";
  try {
    const meRes = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (meRes.ok) {
      const me: { display_name?: string; id?: string } = await meRes.json();
      account = me.display_name ?? me.id ?? "";
    }
  } catch {
    /* best-effort */
  }
  return { state: "ok", account, total: data.total ?? 0 };
}
