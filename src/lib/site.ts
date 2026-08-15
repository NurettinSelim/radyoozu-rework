import { cache } from "react";
import { getLocale } from "next-intl/server";

import { readContent } from "@/lib/content-store";
import { EN_SITE } from "@/content/en";
import type { Site } from "@/content/schema";
import type { Locale } from "@/i18n/routing";

export type { NavItem, Site } from "@/content/schema";

export const RADIO_FOUNDED_YEAR = 2013;
export const RADIO_FOUNDING_DATE = `${RADIO_FOUNDED_YEAR}-11`;

// Structural site data (phone, email, stream, socials, brand) always comes
// from the blob; for English only the text fields (description, address, nav
// labels) are swapped for their static translations.
export const getSite = cache(async (locale?: Locale): Promise<Site> => {
  const site = await readContent("site");
  const l = locale ?? (await getLocale());
  if (l !== "en") return site;
  return {
    ...site,
    description: EN_SITE.description,
    address: EN_SITE.address,
    nav: site.nav.map((item) => ({
      ...item,
      label: EN_SITE.navLabels[item.href] ?? item.label,
    })),
  };
});
