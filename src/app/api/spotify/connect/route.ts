import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { SPOTIFY_SCOPE, SPOTIFY_STATE_COOKIE, callbackUri } from "@/lib/spotify-oauth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/admin/spotify?error=config", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const authorizeUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: callbackUri(req.headers),
      scope: SPOTIFY_SCOPE,
      state,
      show_dialog: "true",
    }).toString();

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(SPOTIFY_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
