# Radyo ÖzÜ — Yönetim Paneli Kurulumu

This guide is for the **technical lead** (the one developer who knows Git/Vercel).
The editor onboarding lives at the bottom.

The site has a built-in admin at `/admin` where editorial board members can
update programs, site info, schedule window, and page copy — without touching
code. Content is stored as JSON in Vercel Blob and served from cached fetches;
edits go live within seconds.

---

## One-time setup (per deployment)

### 1. Google OAuth client

The admin signs in via Google. You need a Google Cloud OAuth 2.0 client.

1. Go to <https://console.cloud.google.com/apis/credentials>
2. Create a project (or reuse one) → **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `Radyo ÖzÜ Admin`
5. Authorized redirect URIs:
   - `https://radyoozu.com/api/auth/callback/google` (production domain)
   - `http://localhost:3000/api/auth/callback/google` (local dev)
6. Save → copy the **Client ID** and **Client secret**

### 2. Vercel Blob store

The blob store holds the editable JSON files.

1. In the Vercel dashboard → **Storage → Create → Blob**
2. Name it `radyoozu-content`
3. Connect it to this project (Production + Preview environments)
4. Vercel will auto-provision `BLOB_READ_WRITE_TOKEN` as an env var

### 3. Environment variables

Set these on Vercel (Production + Preview), and in a local `.env.local`:

| Variable | Value | Notes |
|---|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` | Random 32-byte secret. Rotate yearly. |
| `AUTH_GOOGLE_ID` | from step 1 | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | from step 1 | Google OAuth client secret |
| `AUTH_GOOGLE_HD` | `ozyegin.edu.tr` | Optional. Limits Google account picker to OzU emails. |
| `ADMIN_EMAIL` | `radyoozu@ozu.edu.tr` | The single shared editor account. |
| `BLOB_READ_WRITE_TOKEN` | auto-provisioned | Vercel sets this when you create the Blob store. |
| `BLOB_PUBLIC_BASE_URL` | from seed output | The public base URL of the blob store, e.g. `https://abc123.public.blob.vercel-storage.com`. The seed script prints this. |

For local development you can pull all of them at once after linking the
project:

```bash
vercel link
vercel env pull .env.local
```

### 4. Seed the blob store

The blob store starts empty. Seed it with the current content:

```bash
npm install
vercel env pull .env.local      # gets BLOB_READ_WRITE_TOKEN
npm run seed:blob
```

The script uploads `programs.json`, `site.json`, `schedule-window.json`, and
`copy.json` to Vercel Blob and prints out the public base URL. Copy that URL
into Vercel as `BLOB_PUBLIC_BASE_URL` (and locally into `.env.local`).

### 5. Deploy

`git push` to `main` triggers a Vercel deploy. The admin is live at
`https://radyoozu.com/admin`.

---

## Ongoing maintenance

Once set up, there is **nothing to rotate yearly except the AUTH_SECRET** if
you want to be careful. The `ADMIN_EMAIL` stays the same (`radyoozu@ozu.edu.tr`).
Handoff between radio generations = handing off the Google account password.

The Blob token (`BLOB_READ_WRITE_TOKEN`) does not expire.

### Quarterly backup (recommended)

The blobs are public JSON URLs. A one-liner downloads all editable content:

```bash
mkdir -p backup
for k in programs site schedule-window copy; do
  curl -s "$BLOB_PUBLIC_BASE_URL/content/$k.json" -o "backup/$k.json"
done
```

Commit `backup/` to a private gist or shared drive every few months. If the
blob store ever has issues, restore by running `npm run seed:blob` after
swapping the contents of `src/content/defaults.ts`.

### Defaults fallback

If the blob store is unreachable or empty, the site automatically renders from
`src/content/defaults.ts`. This means the public site never breaks even if
something goes wrong with Blob.

---

## Editor onboarding (give this to non-technical editors)

You can edit the website's programs, social links, schedule hours, and page
texts without touching any code.

1. Go to <https://radyoozu.com/admin>
2. Click **Google ile devam et**
3. Sign in with the shared **`radyoozu@ozu.edu.tr`** account (password held by
   the radio leadership)
4. Pick what you want to edit:
   - **Yayınlar** — add, edit, or remove weekly programs
   - **Site Bilgileri** — phone, address, Instagram, stream URL
   - **Program Saatleri** — which days and hours show in the grid
   - **Metinler** — page titles and descriptions
5. Make your changes → click **Kaydet**
6. Refresh the public page — changes are live within a few seconds

**If something goes wrong**: contact the technical lead. The site itself will
never break — even if your save fails, the previous content keeps showing.

**Security**: never share the `radyoozu@ozu.edu.tr` password outside the
editorial board. If it leaks, the technical lead can change the Google
password and re-share.
