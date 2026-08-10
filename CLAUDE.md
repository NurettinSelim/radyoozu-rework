# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm run seed:blob` — one-time seed of Vercel Blob content store from `src/content/defaults.ts`

No test runner is configured.

## Deployment & branches

Hosted on Vercel (project `radyoozu`, see `.vercel/project.json`) via Vercel's **Git integration** — there are no GitHub Actions / CI workflow files; pushes are deployed by Vercel itself.

- **`main` is the production branch.** Merging/pushing to `main` triggers a production deploy to `radyoozu.com` (see `ADMIN_SETUP.md` step 5). Treat `main` as always-deployable.
- **Every other branch gets an automatic Vercel preview deployment.** Branches follow a `<type>/<slug>` convention using conventional-commit types: `feat/`, `fix/`, `chore/`, `perf/` (e.g. `feat/admin-handoff`, `perf/live-player-optimizations`). Do all work on a feature branch and merge to `main` to ship.
- **Env vars live in Vercel, set for both Production and Preview** (`AUTH_*`, `ADMIN_EMAIL`, `BLOB_*` — full list in `ADMIN_SETUP.md`). A build that passes locally can still fail on Vercel if a var is missing for the target environment. Pull them locally with `vercel env pull .env.local`. **Exception: `NEXT_PUBLIC_GA_ID` (GA4) is set for Production only** so Preview/localhost traffic stays out of the analytics property.
- **Gotcha: the Vercel Blob store is shared across Production and Preview** (same `BLOB_PUBLIC_BASE_URL`). Content edits made through a *preview* deployment's `/admin` write to the same blobs production reads — preview is not isolated for content.

## Stack pinning (important)

- **Next.js 16.2.4** with the App Router under `src/app`. Per `AGENTS.md`, APIs/conventions may differ from training data — consult `node_modules/next/dist/docs/` (notably `01-app/`) before introducing Next.js features. Notable Next 16 specifics already in use:
  - `middleware.ts` was renamed to `proxy.ts` (see `src/proxy.ts`).
  - `revalidateTag` needs a second `profile` arg; for immediate read-your-own-writes use `updateTag(tag)` **inside a Server Action** only.
- **React 19.2.4**, **Tailwind CSS v4** (via `@tailwindcss/postcss`; no `tailwind.config` file — tokens live in `src/app/globals.css`).
- **shadcn** with style `base-nova` (see `components.json`) built on **`@base-ui/react`** primitives, not Radix. This changes component APIs: e.g. `Button` wraps `@base-ui/react/button` and accepts a `render={<Link .../>}` prop instead of `asChild`. Match the existing pattern in `src/components/ui/button.tsx` and `site-header.tsx` when composing primitives.
- **Auth.js v5** (`next-auth@5.0.0-beta.x`) with Google provider; single shared `radyoozu@ozu.edu.tr` account gated by `ADMIN_EMAIL` env var.
- **Vercel Blob** is the persistence layer for editable content. Reads are public-URL fetches with `next: { tags }` caching; writes happen in Server Actions via `@vercel/blob`'s `put()`.
- Path alias `@/*` → `./src/*` (tsconfig).

## Architecture

Single-locale (Turkish) marketing site for Özyeğin University's student radio, with a live-streaming player and a weekly schedule. App Router, mostly RSC with focused `"use client"` islands. There is an admin app at `/admin` for non-technical editors (see `ADMIN_SETUP.md`).

- `src/app/layout.tsx` — root layout: async; forces `className="dark"`, loads Geist + Playfair Display, awaits `getSite()` and passes `nav`/`brand` to `SiteHeader`.
- `src/app/page.tsx` — async; hero + `LivePlayer` (passes `stream`/`brand` props since LivePlayer is client-side).
- `src/app/yayinlar/page.tsx` — async; weekly schedule. Renders `ScheduleGrid` (desktop) and `ScheduleList` (mobile) with `programs` + `scheduleWindow` props.
- `src/app/spotify/page.tsx`, `src/app/iletisim/page.tsx` — async static pages; iletisim points to Instagram DM (no contact form anymore).

Client islands:

- `src/components/live-player.tsx` — `"use client"`; receives `{ stream, brand }` props. Polls `stream.apiBase` (`/status`, `/track/current`) every 20s with `cache: "no-store"`, plays `stream.url` via an `<audio>` element.
- `src/components/schedule-grid.tsx` — `"use client"`; receives `{ programs, window }` props. Computes "today" column + hour cursor from the live `Date`. Window-driven: days, hours, and `jsDayToColumn` mapping all derive from `window` config — no hard-coded day list.
- `src/components/site-header.tsx` — `"use client"` (uses `usePathname`); receives `{ nav, brand }` props.

Analytics (Google Analytics 4, `src/components/analytics/`):

- Consent-gated: `<GoogleAnalytics>` (from `@next/third-parties/google`) is mounted by `analytics.tsx` **only** after the visitor accepts the cookie banner, so no GA script/cookie loads before consent (KVKK/GDPR). Consent lives in a first-party cookie `radyoozu-analytics-consent` read via `useSyncExternalStore` in `consent-context.tsx` (client-only read — keeps locale pages statically prerenderable; no `cookies()` call).
- Wired into `src/app/[locale]/layout.tsx` only (never `/admin`). Pageviews (incl. SPA route changes) are automatic via GA4 Enhanced Measurement.
- Custom events via `trackEvent()` (`track.ts`, wraps `sendGAEvent`): `radio_play` (player Play buttons), `contact_click` (Instagram/phone/email — the Wix "İletişim tıklamaları" equivalent), `outbound_click` (Spotify/social). Contact/outbound links in Server Components use the `TrackedLink` client wrapper (`tracked-link.tsx`) so an `onClick` can fire without making the page a client tree.

Config & content (Vercel Blob-backed, with bundled defaults):

- `src/content/schema.ts` — single source of truth: zod schemas + inferred TS types for `Program`, `Site`, `ScheduleWindow`, `Copy`. Also defines `BLOB_PATHS`.
- `src/content/defaults.ts` — fallback content used if the blob store is unreachable or returns 404. Mirrors the original hard-coded data.
- `src/content/programs.ts`, `src/content/schedule-window.ts`, `src/content/copy.ts`, `src/lib/site.ts` — thin loader modules. Each exports an async `get*()` wrapped in `react.cache()` so multiple consumers within one request deduplicate.
- `src/lib/content-store.ts` — `readContent(key)` does a tag-cached `fetch` of `${BLOB_PUBLIC_BASE_URL}/${BLOB_PATHS[key]}`, validates with the schema, falls back to defaults on failure. `writeContent(key, data)` puts to Vercel Blob with `addRandomSuffix: false, allowOverwrite: true`.
- `scripts/seed-blob.ts` — one-time script: pushes defaults to Blob storage. Run via `npm run seed:blob` after `vercel env pull .env.local`.
- `next.config.ts` — permanent redirects from the legacy site's percent-encoded Turkish URLs (`/haftalık-yayınlar`, `/bize-ulaş`) to the new slugs.

Admin (`/admin`):

- `src/auth.ts` — NextAuth v5 factory with Google provider. `signIn` callback gates by exact `ADMIN_EMAIL` match. Exports `auth`, `signIn`, `signOut`, `handlers`.
- `src/proxy.ts` — `export { auth as proxy }`; matcher `/admin/:path*`. Unauthenticated visits to gated admin routes redirect to `/admin/login`.
- `src/app/admin/login/page.tsx` — public sign-in page (outside the `(authed)` route group).
- `src/app/admin/(authed)/layout.tsx` — defensive `auth()` check + sidebar shell.
- `src/app/admin/(authed)/{programs,site,schedule-window,copy}/` — one editor per resource. Each has `page.tsx`, `_components/*-form.tsx` (RHF + zod), and `actions.ts` (Server Actions that `writeContent` + `updateTag`).
- Shared form pattern: server `writeContent` + `updateTag(<key>)`. Client form uses the same zod schema from `src/content/schema.ts` for inline validation — schema is single source of truth.

When changing the shape of editable content: update `src/content/schema.ts` + `src/content/defaults.ts` + the matching admin form. Re-run `npm run seed:blob` (or rely on the defaults fallback until someone re-saves).
