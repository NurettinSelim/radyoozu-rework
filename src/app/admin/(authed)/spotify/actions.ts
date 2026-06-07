"use server";

import { updateTag } from "next/cache";

import { auth } from "@/auth";
import { SPOTIFY_AUTH_TAG, clearRefreshToken } from "@/lib/spotify-auth-store";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Yetkisiz erişim");
}

export async function disconnectSpotify() {
  await requireAdmin();
  await clearRefreshToken();
  updateTag(SPOTIFY_AUTH_TAG);
  updateTag("spotify-playlists");
}
