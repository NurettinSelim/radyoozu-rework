import { cache } from "react";
import { getLocale } from "next-intl/server";

import { readContent } from "@/lib/content-store";
import { EN_DAY_LABELS } from "@/content/en";
import type { ScheduleWindow } from "@/content/schema";
import type { Locale } from "@/i18n/routing";

export type { DayConfig, ScheduleWindow } from "@/content/schema";

// Canonical day `key`s stay Turkish (used for matching); English only swaps the
// display label + short label per day.
export const getScheduleWindow = cache(
  async (locale?: Locale): Promise<ScheduleWindow> => {
    const window = await readContent("scheduleWindow");
    const l = locale ?? (await getLocale());
    if (l !== "en") return window;
    return {
      ...window,
      days: window.days.map((d) => {
        const t = EN_DAY_LABELS[d.key];
        return t ? { ...d, label: t.label, short: t.short } : d;
      }),
    };
  },
);
