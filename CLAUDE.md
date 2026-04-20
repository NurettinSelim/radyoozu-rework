# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test runner is configured.

## Stack pinning (important)

- **Next.js 16.2.4** with the App Router under `src/app`. Per `AGENTS.md`, APIs/conventions may differ from training data — consult `node_modules/next/dist/docs/` (notably `01-app/`) before introducing Next.js features.
- **React 19.2.4**, **Tailwind CSS v4** (via `@tailwindcss/postcss`; no `tailwind.config` file — tokens live in `src/app/globals.css`).
- **shadcn** with style `base-nova` (see `components.json`) built on **`@base-ui/react`** primitives, not Radix. This changes component APIs: e.g. `Button` wraps `@base-ui/react/button` and accepts a `render={<Link .../>}` prop instead of `asChild`. Match the existing pattern in `src/components/ui/button.tsx` and `site-header.tsx` when composing primitives.
- Path alias `@/*` → `./src/*` (tsconfig).

## Architecture

Single-locale (Turkish) marketing site for Özyeğin University's student radio, with a live-streaming player and a weekly schedule. App Router, mostly RSC with focused `"use client"` islands.

- `src/app/layout.tsx` — root layout: forces `className="dark"` on `<html>`, loads Geist + Playfair Display via `next/font/google`, mounts `SiteHeader`, `SiteFooter`, and the `sonner` Toaster.
- `src/app/page.tsx` — hero + `LivePlayer`.
- `src/app/yayinlar/page.tsx` — weekly schedule, rendered by `ScheduleGrid` (desktop, absolute-positioned grid with a live "now" cursor) and `ScheduleList` (mobile).
- `src/app/spotify/page.tsx`, `src/app/iletisim/page.tsx` — static pages; contact uses `ContactForm` → POSTs to `/api/contact`.
- `src/app/api/contact/route.ts` — validates with zod and **only `console.log`s** the submission. No email/storage is wired up — treat this as a stub.

Client islands & data:

- `src/components/live-player.tsx` — `"use client"`; polls `site.stream.apiBase` (`/status`, `/track/current`) every 20s from the browser with `cache: "no-store"`, and plays `site.stream.url` via an `<audio>` element. Artwork is rendered with `next/image` using `unoptimized` — the domains are also listed in `next.config.ts` `images.remotePatterns`.
- `src/components/schedule-grid.tsx` — `"use client"`; computes "today" column and an hour cursor from `new Date()` on an interval. Schedule window is hard-coded **18:00–22:00, Pzt–Per**; programs outside that window will be clipped. Uses `Program.accent` (a Tailwind gradient fragment) for per-show theming.

Config & content:

- `src/lib/site.ts` — single source of truth for brand metadata, nav, socials, phone, and Radio.co stream/API URLs. Update nav here, not in the header.
- `src/content/programs.ts` — typed `Program[]` that drives the schedule. Day strings are Turkish (`"Pazartesi"`…`"Pazar"`) and must match `Program["day"]`.
- `next.config.ts` — permanent redirects from the legacy site's percent-encoded Turkish URLs (`/haftalık-yayınlar`, `/bize-ulaş`) to the new slugs; add similar entries when renaming public routes.

Forms: `ContactForm` uses `react-hook-form` + `@hookform/resolvers/zod`; the zod schema is duplicated between client (`contact-form.tsx`) and server (`api/contact/route.ts`) — keep them in sync when changing fields.
