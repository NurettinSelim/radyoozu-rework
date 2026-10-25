import { put } from "@vercel/blob";
import type { ZodType } from "zod";

import {
  BLOB_PATHS,
  type ContentKey,
  copySchema,
  programsSchema,
  scheduleWindowSchema,
  siteSchema,
  type Copy,
  type Program,
  type ScheduleWindow,
  type Site,
} from "@/content/schema";
import {
  DEFAULT_COPY,
  DEFAULT_PROGRAMS,
  DEFAULT_SCHEDULE_WINDOW,
  DEFAULT_SITE,
} from "@/content/defaults";

const DEFAULTS = {
  programs: DEFAULT_PROGRAMS,
  site: DEFAULT_SITE,
  scheduleWindow: DEFAULT_SCHEDULE_WINDOW,
  copy: DEFAULT_COPY,
} satisfies Record<ContentKey, unknown>;

type ContentMap = {
  programs: Program[];
  site: Site;
  scheduleWindow: ScheduleWindow;
  copy: Copy;
};

const SCHEMAS: { [K in ContentKey]: ZodType<ContentMap[K]> } = {
  programs: programsSchema,
  site: siteSchema,
  scheduleWindow: scheduleWindowSchema,
  copy: copySchema,
};

function blobUrl(key: ContentKey): string | null {
  const base = process.env.BLOB_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${BLOB_PATHS[key]}`;
}

export async function readContent<K extends ContentKey>(
  key: K,
): Promise<ContentMap[K]> {
  const url = blobUrl(key);
  if (!url) return DEFAULTS[key] as ContentMap[K];

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: [key] },
    });
    if (!res.ok) return DEFAULTS[key] as ContentMap[K];
    const json = await res.json();
    return SCHEMAS[key].parse(json) as ContentMap[K];
  } catch {
    return DEFAULTS[key] as ContentMap[K];
  }
}

export async function writeContent<K extends ContentKey>(
  key: K,
  data: ContentMap[K],
): Promise<void> {
  const validated = SCHEMAS[key].parse(data);
  await put(BLOB_PATHS[key], JSON.stringify(validated, null, 2), {
    access: "public",
    // Explicit: BLOB_READ_WRITE_TOKEN belongs to the (private) secrets store
    // in production; the content store's token arrives under its own name.
    token: process.env.CONTENT_BLOB_RW_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
