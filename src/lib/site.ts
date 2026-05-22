import { cache } from "react";

import { readContent } from "@/lib/content-store";

export type { NavItem, Site } from "@/content/schema";

export const getSite = cache(() => readContent("site"));
