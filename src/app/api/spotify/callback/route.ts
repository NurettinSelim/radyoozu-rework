import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import {
  SPOTIFY_STATE_COOKIE,
  callbackUri,
  exchangeCodeForRefreshToken,
} from "@/lib/spotify-oauth";
import { writeRefreshToken } from "@/lib/spotify-auth-store";

function back(req: NextRequest, params: string) {
  return NextResponse.redirect(new URL(`/admin/spotify?${params}`, req.url));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(SPOTIFY_STATE_COOKIE)?.value;

  if (error) return back(req, `error=${encodeURIComponent(error)}`);
  if (!code || !state || !cookieState || state !== cookieState) {
    return back(req, "error=state");
  }

  const refreshToken = await exchangeCodeForRefreshToken(code, callbackUri(req.headers));
  if (!refreshToken) return back(req, "error=token");

  await writeRefreshToken(refreshToken);
  revalidateTag("spotify-playlists", "max");

  const res = back(req, "connected=1");
  res.cookies.delete(SPOTIFY_STATE_COOKIE);
  return res;
}
