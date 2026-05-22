"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { writeContent } from "@/lib/content-store";
import { siteSchema, type Site } from "@/content/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Yetkisiz erişim");
}

export async function saveSite(input: Site) {
  await requireAdmin();
  const validated = siteSchema.parse(input);
  await writeContent("site", validated);
  updateTag("site");
  revalidatePath("/", "layout");
}
