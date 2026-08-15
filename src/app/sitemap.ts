import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { localePath, SITE_URL } from "@/lib/seo";

const PATHS = ["/", "/yayinlar", "/spotify", "/oyun", "/iletisim"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    routing.locales.map((locale): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      changeFrequency: path === "/yayinlar" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : path === "/yayinlar" ? 0.8 : 0.6,
      alternates: {
        languages: {
          tr: `${SITE_URL}${localePath("tr", path)}`,
          en: `${SITE_URL}${localePath("en", path)}`,
        },
      },
    })),
  );
}
