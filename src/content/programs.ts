import { cache } from "react";
import { getLocale } from "next-intl/server";

import { readContent } from "@/lib/content-store";
import { EN_PROGRAM_TRANSLATIONS } from "@/content/en";
import type { Program } from "@/content/schema";
import type { Locale } from "@/i18n/routing";

export type { Program } from "@/content/schema";

// English swaps each program's tagline + description (matched by slug); title,
// hosts, day and hours stay as the admin-edited blob values.
export const getPrograms = cache(async (locale?: Locale): Promise<Program[]> => {
  const programs = await readContent("programs");
  const l = locale ?? (await getLocale());
  if (l !== "en") return programs;
  return programs.map((p) => {
    const t = EN_PROGRAM_TRANSLATIONS[p.slug];
    return t ? { ...p, tagline: t.tagline, description: t.description } : p;
  });
});
