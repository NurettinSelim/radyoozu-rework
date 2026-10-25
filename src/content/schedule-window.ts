import { cache } from "react";
import { getLocale } from "next-intl/server";

import { readContent } from "@/lib/content-store";
import { EN_DAY_LABELS } from "@/content/en";
import { DAY_KEYS } from "@/content/schema";
import type {
  DayConfig,
  DayKey,
  Program,
  ScheduleWindow,
} from "@/content/schema";
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

// Turkish full labels equal the canonical keys; only shorts need a map.
const TR_DAY_SHORT: Record<DayKey, string> = {
  Pazartesi: "Pzt",
  Salı: "Sal",
  Çarşamba: "Çar",
  Perşembe: "Per",
  Cuma: "Cum",
  Cumartesi: "Cmt",
  Pazar: "Paz",
};

// Display-only: days with at least one program always appear in the schedule,
// even when not part of the admin-configured window.
export function withProgramDays(
  window: ScheduleWindow,
  programs: Program[],
  locale: Locale,
): ScheduleWindow {
  const configured = new Set(window.days.map((d) => d.key));
  const missing = DAY_KEYS.filter(
    (key) => !configured.has(key) && programs.some((p) => p.day === key),
  );
  if (missing.length === 0) return window;
  const extra: DayConfig[] = missing.map((key) =>
    locale === "en"
      ? { key, ...EN_DAY_LABELS[key] }
      : { key, label: key, short: TR_DAY_SHORT[key] },
  );
  const days = [...window.days, ...extra].sort(
    (a, b) => DAY_KEYS.indexOf(a.key) - DAY_KEYS.indexOf(b.key),
  );
  return { ...window, days };
}
