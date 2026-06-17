import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  // Turkish stays at the root (no prefix); English lives under /en/*.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
