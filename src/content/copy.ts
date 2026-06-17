import { cache } from "react";
import { getLocale } from "next-intl/server";

import { readContent } from "@/lib/content-store";
import { EN_COPY } from "@/content/en";
import type { Locale } from "@/i18n/routing";

export type { Copy } from "@/content/schema";

// Turkish copy comes from the editable blob store; English is static (EN_COPY).
// `locale` defaults to the active request locale; pass "tr" explicitly in admin.
export const getCopy = cache(async (locale?: Locale) => {
  const l = locale ?? (await getLocale());
  return l === "en" ? EN_COPY : readContent("copy");
});
