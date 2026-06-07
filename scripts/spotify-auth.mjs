// One-time helper: mint a long-lived Spotify refresh token for the Radyo Özü
// account using the Authorization Code flow (allowed for apps with a secure
// backend). Run it once, log in AS the Radyo Özü Spotify account, approve, then
// copy the printed SPOTIFY_REFRESH_TOKEN into .env.local (and Vercel env).
//
//   node scripts/spotify-auth.mjs
//
// Prerequisites in the Spotify app dashboard (https://developer.spotify.com/dashboard):
//   1. Add redirect URI exactly:  http://127.0.0.1:8888/callback
//   2. If the Radyo Özü account is NOT the app owner, add it under
//      User Management (the app is in Development mode → allowlisted users only).

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "playlist-read-private"; // minimum needed to read the account's playlists

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* .env.local optional if vars are already exported */
  }
  return env;
}

const env = loadEnv();
const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    show_dialog: "true",
  }).toString();

function openBrowser(url) {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    spawn(cmd, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" }).unref();
  } catch {
    /* user can open the URL manually */
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const done = (msg) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<html><body style="font-family:system-ui;background:#0b0b0f;color:#eee;padding:3rem"><h2>${msg}</h2><p>Bu sekmeyi kapatabilirsin.</p></body></html>`);
  };

  if (error) {
    done(`Yetkilendirme reddedildi: ${error}`);
    console.error("Authorization error:", error);
    server.close();
    process.exit(1);
  }
  if (returnedState !== state) {
    done("State uyuşmuyor — güvenlik nedeniyle iptal edildi.");
    console.error("State mismatch.");
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.refresh_token) {
      done("Token alınamadı — terminale bak.");
      console.error("Token exchange failed:", data);
      server.close();
      process.exit(1);
    }

    done("Bağlantı başarılı! ✅");
    console.log("\n✅ Success. Add this to .env.local and Vercel env:\n");
    console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
  } catch (err) {
    done("Beklenmeyen hata — terminale bak.");
    console.error(err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nMake sure this redirect URI is registered in your Spotify app:");
  console.log(`  ${REDIRECT_URI}\n`);
  console.log("Opening Spotify login — log in AS the Radyo Özü account and approve.");
  console.log("If the browser didn't open, paste this URL manually:\n");
  console.log(authUrl + "\n");
  openBrowser(authUrl);
});
