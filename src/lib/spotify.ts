import "server-only";

import { readRefreshToken } from "@/lib/spotify-auth-store";

// Spotify Web API client.
// Listing an account's playlists is user-specific data, so it requires a user
// token (Authorization Code flow), NOT Client Credentials. We hold a long-lived
// refresh token for the Radyo ÖzÜ account (set via the admin "Connect Spotify"
// flow) and exchange it for a short-lived access token on the server at render
// time.
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
  public: boolean | null;
  external_urls?: { spotify?: string };
  images?: Array<{ url: string }> | null;
  owner?: { id?: string };
  // The current API exposes the track collection as `items` ({ total }); older
  // payloads used `tracks`. Read both so the count stays correct either way.
  items?: { total?: number };
  tracks?: { total?: number };
};

/**
 * Keep only the account's own public, non-empty playlists (the ones shown on
 * its Spotify profile, not ones it merely follows), newest first, then map the
 * raw API shape to {@link SpotifyPlaylist} and trim to `limit`.
 */
function mapProfilePlaylists(
  items: Array<SpotifyApiPlaylist | null> | undefined,
  ownerId: string,
  limit: number,
): SpotifyPlaylist[] {
  return (items ?? [])
    .filter((p): p is SpotifyApiPlaylist => Boolean(p))
    .filter((p) => p.owner?.id === ownerId && p.public !== false)
    // Skip empty playlists (e.g. auto-created "N. Çalma Listem" placeholders).
    .filter((p) => (p.items?.total ?? p.tracks?.total ?? 0) > 0)
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: decodeEntities(p.description ?? ""),
      url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
      imageUrl: p.images?.[0]?.url ?? null,
      trackCount: p.items?.total ?? p.tracks?.total ?? 0,
    }));
}

/**
 * Fetch the Radyo ÖzÜ account's own public playlists — the ones shown on its
 * Spotify profile — newest first. Filters out playlists the account merely
 * follows and any private ones. Returns [] when the integration isn't
 * configured or the API is unreachable, so the page falls back to its static
 * design without error handling.
 */
export async function getSpotifyPlaylists(limit = 12): Promise<SpotifyPlaylist[]> {
  const token = await getAccessToken();
  if (!token) return [];

  // Identify the connected account so we keep only playlists it owns (profile
  // playlists), not ones it follows.
  const meRes = await spotifyGet(`${API_BASE}/me`, token);
  if (!meRes || !meRes.ok) return [];
  const me: { id?: string } = await meRes.json();
  if (!me.id) return [];

  // 50 is the page max; fetch a full page, filter to owned + public, then trim.
  const res = await spotifyGet(`${API_BASE}/me/playlists?limit=50`, token);
  if (!res || !res.ok) return [];

  const data: { items?: Array<SpotifyApiPlaylist | null> } = await res.json();
  return mapProfilePlaylists(data.items, me.id, limit);
}

export type SpotifyDiagnostics =
  | { state: "disconnected" }
  | { state: "token_error" }
  | { state: "ok"; account: string; total: number; playlists: SpotifyPlaylist[] }
  | { state: "api_error"; status: number; message: string };

type ApiError = Extract<SpotifyDiagnostics, { state: "api_error" }>;

/**
 * Uncached GET for the diagnostics probe. Returns the parsed JSON or a typed
 * api_error (network failure → status 0, otherwise the HTTP status and
 * Spotify's error message).
 */
async function diagFetch<T>(
  url: string,
  token: string,
): Promise<{ data: T } | { error: ApiError }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { error: { state: "api_error", status: 0, message: "Ağ hatası" } };
  }
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body: { error?: { message?: string } } = await res.json();
      message = body.error?.message ?? message;
    } catch {
      /* non-JSON body */
    }
    return { error: { state: "api_error", status: res.status, message } };
  }
  return { data: await res.json() };
}

/**
 * Live (uncached) probe of the connection for the admin page. Does everything
 * the admin page needs in one pass — one token exchange, one /me, one
 * /me/playlists — and returns the profile playlists alongside the status, so
 * the page needs no separate {@link getSpotifyPlaylists} call. Distinguishes
 * the states that {@link getSpotifyPlaylists} collapses into an empty list —
 * most importantly the Development-Mode 403 ("user not registered for this
 * application"), which otherwise looks like "no playlists found".
 */
export async function getSpotifyDiagnostics(): Promise<SpotifyDiagnostics> {
  const token = await getAccessToken();
  if (!token) {
    return (await readRefreshToken())
      ? { state: "token_error" }
      : { state: "disconnected" };
  }

  // /me names the account and is where the Development-Mode 403 surfaces; its
  // id also scopes the playlist list below to owned (profile) playlists.
  const meResult = await diagFetch<{ display_name?: string; id?: string }>(
    `${API_BASE}/me`,
    token,
  );
  if ("error" in meResult) return meResult.error;
  const me = meResult.data;
  const account = me.display_name ?? me.id ?? "";

  const listResult = await diagFetch<{
    total?: number;
    items?: Array<SpotifyApiPlaylist | null>;
  }>(`${API_BASE}/me/playlists?limit=50`, token);
  if ("error" in listResult) return listResult.error;
  const data = listResult.data;

  // 12 mirrors getSpotifyPlaylists' default so "shown" matches the public page.
  const playlists = me.id ? mapProfilePlaylists(data.items, me.id, 12) : [];
  return { state: "ok", account, total: data.total ?? 0, playlists };
}
