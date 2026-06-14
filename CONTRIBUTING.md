# Contributing to Radyo Özü

Thanks for your interest in improving the Radyo Özü website. This is the public
site for Özyeğin University's student radio. Contributions of all sizes are
welcome — bug fixes, accessibility improvements, docs, and features.

## Ground rules

- Be respectful. This project follows a [Code of Conduct](CODE_OF_CONDUCT.md).
- The UI is **Turkish**. Keep user-facing copy in Turkish; code, comments, and
  commit messages are in English.
- Do **not** open a public issue for security problems — see
  [SECURITY.md](SECURITY.md).

## Getting set up

Prerequisites: **Node.js 20+** and **npm**.

```bash
git clone https://github.com/<your-fork>/radyoozu-rework.git
cd radyoozu-rework
npm install
cp .env.example .env.local   # fill in values (see ADMIN_SETUP.md)
npm run dev                  # http://localhost:3000
```

The public pages (`/`, `/yayinlar`, `/spotify`, `/iletisim`) render from
bundled defaults in `src/content/defaults.ts` even without a configured Blob
store, so you can work on most of the site with an empty `.env.local`. The
`/admin` panel and live "now playing" data need real credentials — see
[ADMIN_SETUP.md](ADMIN_SETUP.md).

## Workflow

1. Fork the repo and create a branch off `main`.
2. Name branches `<type>/<slug>` using conventional-commit types:
   `feat/`, `fix/`, `chore/`, `perf/`, `docs/` (e.g. `feat/program-search`).
3. Make your change. Keep PRs focused and small.
4. Before opening a PR, make sure these pass:
   ```bash
   npm run lint
   npm run build
   ```
5. Open a PR against `main`, fill in the template, and link any related issue.

There is no automated test runner configured; verify changes manually in the
browser and describe how you tested them in the PR.

## Project conventions

- Read [`AGENTS.md`](AGENTS.md): this is **Next.js 16** (App Router) with
  breaking changes from older versions — check `node_modules/next/dist/docs/`
  before using a Next.js API you're unsure about.
- Architecture and stack notes live in [`CLAUDE.md`](CLAUDE.md).
- Editable content shape is defined once in `src/content/schema.ts` (zod). When
  changing content shape, update the schema, `src/content/defaults.ts`, and the
  matching admin form together.
- Use the existing UI primitives in `src/components/ui/` (shadcn on
  `@base-ui/react`). Match the surrounding code's style.

## Reporting bugs and requesting features

Use the GitHub issue templates. Include steps to reproduce, expected vs. actual
behavior, and your browser/OS for bugs.
