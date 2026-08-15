import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";

// Canonical production origin. Referenced by robots, sitemap, llms.txt,
// canonicals, and JSON-LD. Change here if the canonical host ever moves.
export const SITE_URL = "https://radyoozu.com";

// localePrefix "as-needed": Turkish at the root, English under /en.
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
  return path;
}

export function pageAlternates(
  locale: Locale,
  path: string,
): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: {
      tr: localePath("tr", path),
      en: localePath("en", path),
      "x-default": localePath("tr", path),
    },
  };
}
