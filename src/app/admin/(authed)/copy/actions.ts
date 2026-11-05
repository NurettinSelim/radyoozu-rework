"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";

import { auth, isAdminSession } from "@/auth";
import { writeContent } from "@/lib/content-store";
import { copySchema, type Copy } from "@/content/schema";

async function requireAdmin() {
  const session = await auth();
  if (!isAdminSession(session)) throw new Error("Yetkisiz erişim");
}

export async function saveCopy(input: Copy) {
  await requireAdmin();
  const validated = copySchema.parse(input);
  await writeContent("copy", validated);
  updateTag("copy");
  revalidatePath("/", "layout");
}
