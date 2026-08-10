# Repository Guidelines

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

Radyo ÖzÜ is Özyeğin University’s student-radio website. It uses Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS v4, and Vercel. Public routes provide a live Radio.co player, weekly schedule, Spotify content, and contact information. Turkish is the default locale; English is served under `/en`. A non-localized `/admin` CMS lets one Google-authenticated editor update Blob-backed content.

## Architecture & Data Flow

- `src/app/layout.tsx` only imports global CSS. The localized public tree (`src/app/[locale]`) and admin tree (`src/app/admin`) render their own document layouts.
- `src/proxy.ts` is the request boundary: Auth.js protects `/admin/*`; other page requests pass through `next-intl`. Next.js 16 uses `proxy.ts`, not `middleware.ts`.
- Prefer React Server Components. Keep client islands focused on browser state and interaction: the player, responsive schedule, admin forms, consent/analytics, and mobile navigation.
- Public read flow: route Server Component → locale-aware loader → `src/lib/content-store.ts` → Vercel Blob JSON → Zod validation. Missing or invalid Blob data falls back to `src/content/defaults.ts`.
- English content combines shared structural data from Blob with static translations in `src/content/en.ts`; message translations live in `messages/{tr,en}.json`.
- Admin write flow: protected page → React Hook Form client component → Server Action → repeat `auth()` authorization → Zod parse → `writeContent()` → cache-tag/path invalidation. Never rely only on the proxy for mutation authorization.
- `src/components/live-player-provider.tsx` owns the single audio element, playback state, volume, errors, and 20-second Radio.co metadata polling. Player surfaces consume that context instead of creating competing audio state.
- Spotify OAuth uses route handlers under `src/app/api/spotify/`; server-side helpers and refresh-token storage live in `src/lib/spotify*.ts`.
- There is no dependency-injection container or global store. Shared behavior uses imported service modules, server-to-client props, React context, and local hooks.

## Key Directories

- `src/app/` — App Router layouts, public/admin pages, route handlers, and Server Actions.
- `src/components/` — Shared site components and focused client islands; `ui/` contains shadcn primitives on `@base-ui/react`, while `analytics/` contains consent-gated analytics.
- `src/content/` — Zod schemas, Blob paths, bundled defaults, and static English overrides.
- `src/lib/` — Content persistence, site loaders, Spotify API/OAuth, and small utilities.
- `src/i18n/` and `messages/` — Locale routing, request configuration, navigation wrappers, and UI messages.
- `scripts/` — Operational scripts; currently the Vercel Blob seed script.
- `public/` — Logos and static assets. Logo trademark restrictions are documented in `NOTICE`.

## Development Commands

```bash
npm install                 # install from package-lock.json
npm run dev                 # Next dev server on http://localhost:3000
npm run lint                # ESLint Core Web Vitals + TypeScript rules
npm run build               # production build and framework/type validation
npm run start               # serve an existing production build
npm run seed:blob           # overwrite Blob content from bundled defaults
```

For local configuration, copy `.env.example` to `.env.local`, or run `vercel link` followed by `vercel env pull .env.local`. Public pages work from defaults without Blob credentials; admin, Blob writes, and Spotify connection flows need real credentials. There is no `test`, `typecheck`, or format script.

## Code Conventions & Common Patterns

- Use strict TypeScript and the `@/*` alias for `src/*`. Follow the existing two-space, semicolon, double-quote style; no Prettier configuration exists.
- Use kebab-case filenames, PascalCase React components/types, camelCase functions, and uppercase module constants. Keep route-local helpers, forms, and actions beside the route that owns them.
- Server Components are the default. Add `"use client"` only for browser APIs, event handlers, hooks, or context. Pass fetched server data into client components as serializable props.
- Next.js 16 route `params` are promises in this codebase; await them. Validate locales with `hasLocale`, call `setRequestLocale`, and use the wrappers in `src/i18n/navigation.ts` for localized links/navigation.
- Put UI messages in both `messages/tr.json` and `messages/en.json`; keep editable content translations aligned with `src/content/en.ts`. Code and comments remain English.
- Treat `src/content/schema.ts` as the content contract. A shape change normally updates the schema, `src/content/defaults.ts`, applicable English overrides, and the matching admin form/action together.
- Validate external/persisted data with Zod at the boundary. Public reads intentionally degrade to defaults or `null`; authenticated writes should fail explicitly and retain Turkish user-facing errors.
- Use `Promise.all` for independent I/O. Effects that poll or subscribe must clean up timers/listeners and avoid state updates after unmount.
- State stays local unless multiple surfaces need it. Use context for cross-tree browser state (player, consent) and React Hook Form plus Zod for admin forms; do not introduce a second state pattern casually.
- Reuse `src/components/ui/` and `cn()` from `src/lib/utils.ts`. The shadcn setup is `base-nova` on Base UI, not Radix; follow existing `render={<... />}` composition rather than assuming `asChild`.
- Tailwind v4 is CSS-first: tokens and theme variables live in `src/app/globals.css`; there is no `tailwind.config.*`.
- Keep secrets server-only. Only intentionally public values may use `NEXT_PUBLIC_*`; never commit `.env.local`.

## Important Files

- `package.json` / `package-lock.json` — authoritative scripts, versions, and npm dependency graph.
- `src/app/[locale]/layout.tsx` — public document, metadata, fonts, providers, and locale setup.
- `src/app/admin/layout.tsx` and `src/app/admin/(authed)/layout.tsx` — admin document and authenticated shell.
- `src/proxy.ts` / `src/auth.ts` — locale negotiation and single-account admin authorization.
- `src/i18n/routing.ts` / `src/i18n/request.ts` — supported locales and message loading.
- `src/content/schema.ts` / `src/content/defaults.ts` / `src/content/en.ts` — editable data contract, offline fallback, and English overrides.
- `src/lib/content-store.ts` — validated Blob reads/writes and cache policy.
- `src/components/live-player-provider.tsx` — shared live-audio state and Radio.co polling.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` — framework and tooling behavior.
- `.env.example` / `ADMIN_SETUP.md` — environment inventory and admin/Blob/OAuth setup.

## Runtime/Tooling Preferences

- Use Node.js 20.9+ and npm. `package-lock.json` is lockfile version 3; do not switch to Bun, pnpm, or Yarn or create another lockfile.
- This is Next.js 16.2.9, not an older App Router version. Before using or changing a Next.js API, read the relevant bundled guide in `node_modules/next/dist/docs/` and follow current deprecations.
- Tailwind CSS v4 runs through `@tailwindcss/postcss`; ESLint 9 uses flat config. No formatter is enforced, so preserve surrounding formatting.
- Vercel Git integration deploys `main` to production and feature branches to previews. Use `<type>/<slug>` branch names such as `feat/program-search` or `fix/player-reconnect`.
- `npm run seed:blob` is operational and overwrites stable Blob paths. Confirm the target environment first; preview and production may share the same Blob store.

## Testing & QA

No automated test framework, test files, coverage requirement, or GitHub Actions workflow is configured. Do not claim `npm test` coverage.

Before a PR:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Exercise the changed behavior in a browser and record exact manual checks in the PR.

For public UI changes, check Turkish and `/en`, desktop and mobile layouts, and the real interactive path rather than only page load. For admin or Spotify changes, use configured credentials and verify authorization, validation failures, persistence, and the public read-after-write result. Vercel preview deployments are the normal integration-check environment.
