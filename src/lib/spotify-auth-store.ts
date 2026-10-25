import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { get, put } from "@vercel/blob";

// Persists the Radyo ÖzÜ Spotify refresh token. The token is a secret, so it
// lives in a PRIVATE blob object (requires BLOB_READ_WRITE_TOKEN to read — the
// public URL 404s for strangers) and is additionally AES-256-GCM encrypted with
// a key derived from AUTH_SECRET, as a second layer.
//
// A SPOTIFY_REFRESH_TOKEN env var, if set, always wins (lets you pin a token
// without the web flow).

const BLOB_PATH = "content/spotify-auth.json";

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

  try {
    // Private read: requires BLOB_READ_WRITE_TOKEN. Missing credentials or
    // object → null ("disconnected"), never a crash. useCache:false — CDN
    // caching could serve a stale token after clearRefreshToken() overwrites
    // the path (admin disconnect/reconnect must take effect immediately).
    const res = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    const data: { token?: string } = JSON.parse(text);
    if (!data.token) return null;
    return decrypt(data.token);
  } catch {
    return null;
  }
});

export async function writeRefreshToken(token: string): Promise<void> {
  // Explicit private access: the object is readable only with the blob
  // token, never via a public URL.
  await put(BLOB_PATH, JSON.stringify({ token: encrypt(token) }), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Mark as disconnected by clearing the stored token. */
export async function clearRefreshToken(): Promise<void> {
  await put(BLOB_PATH, JSON.stringify({ token: "" }), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function isSpotifyConnected(): Promise<boolean> {
  return (await readRefreshToken()) !== null;
}
