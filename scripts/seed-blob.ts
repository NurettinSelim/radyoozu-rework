import { put } from "@vercel/blob";

import {
  DEFAULT_COPY,
  DEFAULT_PROGRAMS,
  DEFAULT_SCHEDULE_WINDOW,
  DEFAULT_SITE,
} from "../src/content/defaults.ts";
import { BLOB_PATHS, type ContentKey } from "../src/content/schema.ts";

const PAYLOADS: Record<ContentKey, unknown> = {
  programs: DEFAULT_PROGRAMS,
  site: DEFAULT_SITE,
  scheduleWindow: DEFAULT_SCHEDULE_WINDOW,
  copy: DEFAULT_COPY,
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "BLOB_READ_WRITE_TOKEN missing. Run `vercel link` then `vercel env pull .env.local`.",
    );
    process.exit(1);
  }

  const urls: Record<string, string> = {};
  for (const [key, payload] of Object.entries(PAYLOADS)) {
    const path = BLOB_PATHS[key as ContentKey];
    const result = await put(path, JSON.stringify(payload, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    urls[key] = result.url;
    console.log(`  ${key.padEnd(16)} → ${result.url}`);
  }

  const first = Object.values(urls)[0];
  const base = first.slice(0, first.indexOf("/content/"));
  console.log("\nSet this env var on Vercel (Production + Preview):");
  console.log(`  BLOB_PUBLIC_BASE_URL=${base}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
