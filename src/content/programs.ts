import { cache } from "react";

import { readContent } from "@/lib/content-store";

export type { Program } from "@/content/schema";

export const getPrograms = cache(() => readContent("programs"));
