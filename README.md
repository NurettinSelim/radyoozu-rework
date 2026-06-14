# Radyo Özü

Website for **Radyo Özü**, the student radio station of [Özyeğin University](https://www.ozyegin.edu.tr) (Istanbul, Turkey). Single-locale (Turkish) marketing site with a live streaming player, weekly schedule grid, and a built-in CMS at `/admin` for non-technical editors.

## Features

- Live radio player with real-time "now playing" metadata (Radio.co API)
- Weekly program schedule — desktop grid + mobile list view
- Admin panel at `/admin` — edit programs, site info, schedule hours, and page copy without touching code
- Content stored in Vercel Blob; edits go live in seconds
- Spotify playlist integration

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **shadcn** on `@base-ui/react` primitives
- **Auth.js v5** (Google OAuth, single-account admin gate)
- **Vercel Blob** for editable content

## Local setup

**Prerequisites:** Node.js 20+, npm, a Vercel account (for Blob + env vars).

```bash
git clone https://github.com/NurettinSelim/radyoozu-rework.git
cd radyoozu-rework
npm install

# Pull real env vars from Vercel (requires `vercel link` first)
vercel link
vercel env pull .env.local

# Or copy the template and fill in values manually
cp .env.example .env.local

npm run dev   # http://localhost:3000
```

Public pages (`/`, `/yayinlar`, `/spotify`, `/iletisim`) render from bundled
defaults even without a Blob store, so you can work on most of the UI with a
minimal `.env.local`. The `/admin` panel needs real credentials — see
[ADMIN_SETUP.md](ADMIN_SETUP.md).

## Environment variables

All required variables are listed and documented in [`.env.example`](.env.example).
Full setup instructions (Google OAuth, Blob store, seeding) are in [ADMIN_SETUP.md](ADMIN_SETUP.md).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run seed:blob` | One-time seed of Blob content store from defaults |

## Deployment

Hosted on Vercel via Git integration — no CI workflow files needed.

- `main` is the production branch → pushes deploy to radyoozu.com
- Every other branch gets an automatic preview deployment

Use `feat/`, `fix/`, `chore/`, `perf/` branch prefixes (conventional-commit style).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report security issues privately via [SECURITY.md](SECURITY.md).

## License & trademarks

Source code is licensed under the [MIT License](LICENSE).

The Radyo Özü and Özyeğin University logos (`public/radyo-ozu-logo.svg`, `public/radyoozu-logo.png`) are trademarks of Özyeğin University and are **not** covered by the MIT License. See [NOTICE](NOTICE) for details. If you fork this project for your own station, replace these assets with your own branding.
