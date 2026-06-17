import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware drop-ins for next/link + next/navigation. With localePrefix
// "as-needed" these omit the prefix for `tr` and add `/en` for English.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
