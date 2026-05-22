"use server";

import { updateTag } from "next/cache";

import { auth } from "@/auth";
import { writeContent } from "@/lib/content-store";
import { scheduleWindowSchema, type ScheduleWindow } from "@/content/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Yetkisiz erişim");
}

export async function saveScheduleWindow(input: ScheduleWindow) {
  await requireAdmin();
  const validated = scheduleWindowSchema.parse(input);
  await writeContent("scheduleWindow", validated);
  updateTag("scheduleWindow");
}
