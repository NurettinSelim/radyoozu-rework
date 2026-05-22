import { cache } from "react";

import { readContent } from "@/lib/content-store";

export type { Copy } from "@/content/schema";

export const getCopy = cache(() => readContent("copy"));
