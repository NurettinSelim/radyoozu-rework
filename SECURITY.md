# Security Policy

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions, or pull requests.**

Instead, report them privately through either:

- GitHub's **[Report a vulnerability](https://github.com/NurettinSelim/radyoozu-rework/security/advisories/new)**
  feature (Security → Advisories), or
- Email **radyoozu@ozu.edu.tr** with the subject line `SECURITY`.

Please include:

- A description of the issue and its potential impact
- Steps to reproduce (proof-of-concept if possible)
- Any affected URLs, components, or configuration

We will acknowledge your report as soon as we can and keep you updated on the
fix. Please give us a reasonable window to address the issue before any public
disclosure.

## Scope

This repository hosts the Radyo Özü marketing site and its `/admin` content
editor. Relevant areas include authentication (`src/auth.ts`, `src/proxy.ts`),
the admin Server Actions under `src/app/admin/`, and the Vercel Blob content
store (`src/lib/content-store.ts`).

Secrets (`AUTH_*`, `ADMIN_EMAIL`, `BLOB_*`, `SPOTIFY_*`) are provided via
environment variables and are never committed. If you believe a secret has been
exposed, treat it as a vulnerability and report it privately as above.

## Supported versions

Only the latest deployed version (`main`, served at radyoozu.com) is supported.
