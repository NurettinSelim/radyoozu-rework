import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { del, get, put } from "@vercel/blob";

// Persists the Radyo ÖzÜ Spotify refresh token in a dedicated PRIVATE blob
// store (radyoozu-secrets): objects there require authentication (OIDC from
// the Vercel runtime — the store is connected to this project — or a
// store-scoped token) so the value is never publicly downloadable. It is
// additionally AES-256-GCM encrypted with a key derived from AUTH_SECRET as a
// second layer.
//
// A SPOTIFY_REFRESH_TOKEN env var, if set, always wins (lets you pin a token
// without the web flow).

const SECRETS_STORE_ID = process.env.SPOTIFY_BLOB_STORE_ID;
const BLOB_PATH = "spotify-auth.json";

function requireSecretsStoreId(): string {
  if (!SECRETS_STORE_ID) {
    throw new Error("SPOTIFY_BLOB_STORE_ID is required to store the Spotify token blob");
  }
  return SECRETS_STORE_ID;
}

function key(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Deriving from "" would make the public blob decryptable with the
    // well-known SHA256("") key. Fail loudly instead of encrypting with it.
    throw new Error("AUTH_SECRET is required to encrypt/decrypt the Spotify token blob");
  }
  return createHash("sha256").update(secret).digest();
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

function decrypt(payload: string): string | null {
  try {
    const [ivB, tagB, encB] = payload.split(":");
    if (!ivB || !tagB || !encB) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB, "base64"));
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(encB, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Returns the plaintext refresh token, or null if not connected / unreadable.
 * Memoized per request: /admin/spotify reads it via isSpotifyConnected() and
 * getSpotifyDiagnostics(); without this each call is a serial blob round-trip.
 * Same-request write-then-read never happens (write paths don't read back), so
 * staleness within a request is not a concern.
 */
export const readRefreshToken = cache(async (): Promise<string | null> => {
  const fromEnv = process.env.SPOTIFY_REFRESH_TOKEN;
  if (fromEnv) return fromEnv;

  let plain: string | null = null;
  try {
    // Private read: authenticates via runtime OIDC for the connected store.
    // Missing credentials or object → fall through to migration. useCache:false
    // — CDN caching could serve a stale token after clearRefreshToken()
    // overwrites the path (admin disconnect/reconnect must take effect
    // immediately).
    const res = await get(BLOB_PATH, {
      access: "private",
      storeId: requireSecretsStoreId(),
      useCache: false,
    });
    if (res && res.statusCode === 200) {
      const text = await new Response(res.stream).text();
      const data: { token?: string } = JSON.parse(text);
      plain = data.token ? decrypt(data.token) : null;
    }
  } catch {
    // fall through to legacy migration below
  }
  if (plain) return plain;

  // One-time fallback: nothing usable in the private store yet — try moving
  // the legacy public-blob token over (TEMPORARY, removed after migration).
  return migrateLegacyToken();
});

/** TEMPORARY one-time migration: move the legacy public-blob ciphertext into
 * the private secrets store, then delete the public object. Removed after the
 * migration has run in production. */
async function migrateLegacyToken(): Promise<string | null> {
  const base = process.env.BLOB_PUBLIC_BASE_URL;
  const legacyToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!base || !legacyToken || !SECRETS_STORE_ID) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/content/spotify-auth.json`);
    if (!res.ok) return null;
    const legacy: { token?: string } = await res.json();
    if (!legacy.token) return null;
    const plain = decrypt(legacy.token);
    if (!plain) return null;
    await put(BLOB_PATH, JSON.stringify({ token: legacy.token }), {
      access: "private",
      storeId: SECRETS_STORE_ID,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    await del("content/spotify-auth.json", { token: legacyToken });
    return plain;
  } catch {
    return null;
  }
}

export async function writeRefreshToken(token: string): Promise<void> {
  // Private store: objects are readable only with authenticated requests,
  // never via a public URL.
  await put(BLOB_PATH, JSON.stringify({ token: encrypt(token) }), {
    access: "private",
    storeId: requireSecretsStoreId(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Mark as disconnected by clearing the stored token. */
export async function clearRefreshToken(): Promise<void> {
  await put(BLOB_PATH, JSON.stringify({ token: "" }), {
    access: "private",
    storeId: requireSecretsStoreId(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function isSpotifyConnected(): Promise<boolean> {
  return (await readRefreshToken()) !== null;
}
