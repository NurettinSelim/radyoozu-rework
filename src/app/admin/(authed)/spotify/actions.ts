"use server";

import { updateTag } from "next/cache";

import { auth, isAdminSession } from "@/auth";
import { clearRefreshToken } from "@/lib/spotify-auth-store";

async function requireAdmin() {
  const session = await auth();
  if (!isAdminSession(session)) throw new Error("Yetkisiz erişim");
}

export async function disconnectSpotify() {
  await requireAdmin();
  await clearRefreshToken();
  updateTag("spotify-playlists");
}
