import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { put } from "@vercel/blob";

// Persists the Radyo Özü Spotify refresh token. The token is a secret, so it's
// encrypted (AES-256-GCM, key derived from AUTH_SECRET) before being stored in
// the blob store — this reuses the existing public-read / put-write path while
// keeping the value unreadable without the server secret.
//
// A SPOTIFY_REFRESH_TOKEN env var, if set, always wins (lets you pin a token
// without the web flow, e.g. when minted via scripts/spotify-auth.mjs).

const BLOB_PATH = "content/spotify-auth.json";
export const SPOTIFY_AUTH_TAG = "spotify-auth";

function key(): Buffer {
  return createHash("sha256")
    .update(process.env.AUTH_SECRET ?? "")
    .digest();
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

function blobUrl(): string | null {
  const base = process.env.BLOB_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${BLOB_PATH}`;
}

/** Returns the plaintext refresh token, or null if not connected / unreadable. */
export async function readRefreshToken(): Promise<string | null> {
  const fromEnv = process.env.SPOTIFY_REFRESH_TOKEN;
  if (fromEnv) return fromEnv;

  const url = blobUrl();
  if (!url) return null;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: [SPOTIFY_AUTH_TAG] },
    });
    if (!res.ok) return null;
    const data: { token?: string } = await res.json();
    if (!data.token) return null;
    return decrypt(data.token);
  } catch {
    return null;
  }
}

export async function writeRefreshToken(token: string): Promise<void> {
  await put(BLOB_PATH, JSON.stringify({ token: encrypt(token) }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Mark as disconnected by clearing the stored token. */
export async function clearRefreshToken(): Promise<void> {
  await put(BLOB_PATH, JSON.stringify({ token: "" }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function isSpotifyConnected(): Promise<boolean> {
  return (await readRefreshToken()) !== null;
}
