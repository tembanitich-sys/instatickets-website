# InstaTickets pre-launch website

Public pre-launch site for InstaTickets ([www.instatickets.co.zw](https://www.instatickets.co.zw)), launching **15 November 2026, 00:00 Harare time**. It builds anticipation, collects customer pre-registrations and business leads, and is the front door of the larger platform. It has no booking, customer accounts or partner portal.

Next.js (App Router), TypeScript (strict), Tailwind CSS, Postgres (Neon) with Drizzle, Cloudflare Turnstile, Resend, Upstash Redis, Vercel Web Analytics. The full build brief is in [`docs/WEBSITE_BRIEF.md`](docs/WEBSITE_BRIEF.md).

## Contents

1. [Run locally](#run-locally)
2. [Environment variables](#environment-variables)
3. [Changing copy](#changing-copy)
4. [Deploying to Vercel](#deploying-to-vercel)
5. [Pointing the domain at Vercel (DNS at Vertico)](#pointing-the-domain-at-vercel-dns-at-vertico)
6. [Launch-day checklist](#launch-day-checklist)
7. [How it works](#how-it-works): countdown, forms, admin
8. [Security, SEO and quality](#security-seo-and-quality)
9. [Brand assets](#brand-assets)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest; uses an in-memory Postgres, no database needed
npm run lint
npx tsc --noEmit
npm run build
```

Node 22 or newer. Copy `.env.example` to `.env.local` for local settings. With nothing configured the site still runs: the GET STARTED link falls back to WhatsApp, forms refuse to save (they never pretend to), and in development the Cloudflare test keys are used for Turnstile automatically.

## Environment variables

Set these in Vercel (**Project > Settings > Environment Variables**). [`.env.example`](.env.example) has the same list with comments.

| Variable | Needed for | Notes |
|---|---|---|
| `DATABASE_URL` | forms, admin, GET STARTED link | Neon pooled connection string (from the Vercel Marketplace). Run `npm run db:migrate` once after setting it. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | forms, admin sign-in | **Baked into the browser bundle at build time**, so set it *before* the deploy that should use it. |
| `TURNSTILE_SECRET_KEY` | forms, admin sign-in | Server side. In production, missing keys mean every submission is refused (fail closed). |
| `RESEND_API_KEY`, `EMAIL_FROM` | notification emails | `EMAIL_FROM` must be on a verified sending domain, for example `InstaTickets Website <website@instatickets.co.zw>`. Without a key, submissions still save and the failed email is logged. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | rate limiting, admin lockout | Optional but recommended. Without them an in-memory limiter is used, which only counts per server instance. |
| `RATE_LIMIT_SALT` | rate limiting, admin lockout | Any long random string. Visitor IPs are hashed with it and never stored. |
| `ADMIN_PASSWORD` | `/admin` | At least 12 characters; use a long passphrase. |
| `ADMIN_SESSION_SECRET` | `/admin` | At least 32 random characters (`openssl rand -hex 32`). Changing it or the password signs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | metadata, sitemap | Defaults to `https://www.instatickets.co.zw`. |

Until real Cloudflare keys exist, Cloudflare's published **test keys** can be used (they always pass, so they give no spam protection):

- site key `1x00000000000000000000AA`
- secret key `1x0000000000000000000000000000000AA`

Replace them with real keys before launch.

### Database

The schema is in `src/lib/db/schema.ts` and the SQL migrations are checked in under `drizzle/`.

```bash
DATABASE_URL="postgres://..." npm run db:migrate   # apply migrations; safe to re-run
npm run db:generate                                 # after changing the schema: creates a new migration
```

Migrations are **not** run automatically during the Vercel build. `db:generate` fetches `drizzle-kit` on demand rather than installing it, which keeps the Vercel install free of warnings. `package.json` also has an `allowScripts` entry that blocks the install script of `unrs-resolver` (a linting helper): its native binary is installed as a separate package, so the script is not needed, and newer npm versions otherwise warn about unreviewed install scripts.

## Changing copy

All public copy lives in [`content/site.ts`](content/site.ts) (brief Appendix A and B). Components read from it; change wording there and you should not need to touch components. Admin screens use plain functional wording that lives with the admin components.

The privacy notice (`/privacy`) keeps its unconfirmed values in square brackets, for example `[DATE PUBLISHED]`, `[REGISTERED COMPANY NAME]`, `[12]`, `[24]` and `[30]`, and renders them **highlighted** so they cannot be missed. Replace them in `content/site.ts` once confirmed. `/terms` and `/cookies` are COMING SOON placeholders; no legal text has been written.

A test (`tests/content-rules.test.ts`) fails the build if wording breaks the brief's content rules: no payment provider or wallet named, no leadership or "we own inventory" claims, no "integrates automatically" claims, no "coming soon" on Events or Sports, no prices, discounts or testimonials, no personal names or emails, no social accounts, and no raw WhatsApp address shown.

## Deploying to Vercel

The project is imported from this repository. `vercel.json` sets the function region to `cpt1` (Cape Town), the closest available region to Zimbabwe. Do not set it in the dashboard as well.

1. **Production branch.** Create a `main` branch and make it the repository's default and Vercel's production branch. Until then, whichever branch was pushed first is treated as production, and previews are labelled production.
2. **Framework preset.** Set it to *Next.js* (**Settings > Build & Deployment**). It is currently read as "Other" because the project was imported while the repository was empty; `vercel.json` forces the right build meanwhile.
3. **Environment variables.** Add the table above, then redeploy (the Turnstile site key needs a fresh build).
4. **Database.** Add Neon from the Vercel Marketplace, then run `npm run db:migrate` against it.
5. **Web Analytics.** Open the project's **Analytics** tab and click *Enable*. The site already includes the (cookieless) Analytics script. Until it is enabled, the script returns a 404, which shows as a console error and lowers the Best Practices score.
6. **Email.** In Resend, verify `instatickets.co.zw` as a sending domain and add the SPF and DKIM records it shows to the Vertico DNS (see below). Make sure the `info@` and `registrations@` mailboxes exist.

## Pointing the domain at Vercel (DNS at Vertico)

`instatickets.co.zw` is registered at Vertico and its DNS is managed there. You add records in Vertico's DNS management for the domain; Vercel does not need to take over the nameservers.

**1. Add the domains to the Vercel project.** In **Project > Settings > Domains** add `www.instatickets.co.zw` and `instatickets.co.zw`. Make `www.instatickets.co.zw` the primary and let the bare domain redirect to it. Vercel then shows the exact records it wants; **copy the values from that screen**, because the `CNAME` target can differ per project.

**2. Add the records at Vertico.**

| Type | Name / host | Value |
|---|---|---|
| `CNAME` | `www` | the target Vercel shows, for example `cname.vercel-dns-0.com` (older projects show `cname.vercel-dns.com`) |
| `A` | `@` (the bare domain) | `76.76.21.21` |

A bare domain cannot use a `CNAME`, which is why it uses an `A` record. If a record for `www` or `@` already exists (for example an old parking page), replace it rather than adding a second one. Leave the existing `MX` records alone: they deliver the `info@` and `registrations@` mail.

**3. Add the email-sending records.** Resend shows a few `TXT`/`CNAME` records (SPF, DKIM, and optionally DMARC) for the sending domain. Add them exactly as shown. Do not change or remove any existing SPF `TXT` record; merge Resend's `include:` into it if one exists, because a domain may have only one SPF record.

**4. Wait and check.** DNS changes can take from a few minutes to several hours. In Vercel the domain turns from "Invalid Configuration" to valid, and an HTTPS certificate is issued automatically. Then confirm:

- `https://www.instatickets.co.zw` loads the site and `https://instatickets.co.zw` redirects to it;
- `https://www.instatickets.co.zw/robots.txt` and `/sitemap.xml` show the right address.

**5. Lower the risk.** A day before launch, lower the TTL on these records at Vertico (for example 300 seconds) so a mistake is quick to fix, and check that Cloudflare Turnstile allows the `www.instatickets.co.zw` hostname.

## Launch-day checklist

- [ ] Real Turnstile keys, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `RATE_LIMIT_SALT` set; site key set before the build.
- [ ] Database created and migrated; Resend domain verified; both mailboxes exist.
- [ ] Every `[bracketed]` value in the privacy notice confirmed and replaced.
- [ ] `main` is the production branch; domain and HTTPS working; Web Analytics enabled.
- [ ] Upstash configured so the admin lockout and rate limits are shared across servers.
- [ ] Test each form once in production and confirm the row and the email arrive.
- [ ] Admin > Settings: set the **GET STARTED link** (or leave it as the WhatsApp default). It takes effect immediately, with no redeploy.
- [ ] At **00:00 on 15 November** the countdown switches to **INSTATICKETS IS NOW LIVE** by itself.

## How it works

### Countdown

The launch instant is hard-coded in [`src/lib/countdown.ts`](src/lib/countdown.ts) as `2026-11-14T22:00:00Z` (00:00 on 15 November 2026 in Harare). The home page is re-rendered at most once a minute, so the server-rendered first value is close to current and nothing jumps. In the browser the clock is corrected against `/api/now` (server time), so a wrong device clock cannot show the wrong countdown or switch to "live" early. From the launch instant the countdown is replaced by **INSTATICKETS IS NOW LIVE** and a **GET STARTED** button.

**Previewing the after-launch state** (local development and Vercel preview deployments only; ignored in production):

- `/?launched=1` jumps to the launch instant.
- `/?now=2026-11-14T21:59:50Z` simulates that moment, then keeps counting, so you can watch the switch.

The GET STARTED link is stored in the `site_settings` table (`get_started_url`), read at most once a minute, and refreshed at once when saved in the admin. Only `https://` links are accepted. Default: the WhatsApp chat link.

### Forms

The customer pre-registration (home), business registration (`/for-businesses`) and contact (`/contact`) forms are Next.js server actions in [`src/app/actions.ts`](src/app/actions.ts); the logic is in `src/lib/forms/`. Every submission goes through the same steps, in this order:

1. parse and validate on the server with Zod; phone numbers are checked with `libphonenumber-js` and stored in E.164 (for example `+263771234567`);
2. rate limit per visitor and form (5 per 10 minutes); the IP is hashed and never stored or logged;
3. return field messages if anything is invalid, without spending the one-time Turnstile token;
4. verify the Cloudflare Turnstile token server-side (fails closed);
5. store the record in Postgres;
6. only then send the notification email; a failed email is logged (with no personal details) and never fails the submission.

If the database is unavailable the visitor gets an error; a submission is never reported as saved when it was not.

- Marketing consent is never pre-ticked. It is stored as `marketing_consent` plus `marketing_consent_at` (null when not given). The privacy acknowledgement is required and the notice version (`2026-10-pre-launch`) is stored with every record.
- A pre-registration with a phone number already on file updates that record and shows the same success message. The latest submission wins for interests and marketing consent (unticked withdraws consent and clears the timestamp). A blank email never erases one already given; the name and first campaign tags stay as first recorded.
- Business registrations always insert a new row. The contact form's phone is optional.
- Campaign tags (`utm_source`, `utm_medium`, `utm_campaign`) from the landing URL are remembered for the tab (session storage) and saved with the form.

Customer and business forms email `registrations@instatickets.co.zw`; the contact form emails `info@instatickets.co.zw`. Emails are plain text with fixed subjects.

### Admin (`/admin`)

Not linked from the public site, `noindex`, and never cached.

- **Sign in** with `ADMIN_PASSWORD` (plus Turnstile). The session is a signed cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, scoped to `/admin`, 8 hours). If the password or secret is missing or too weak, sign-in is unavailable and the reason is written to the server log.
- **Lockout:** five wrong passwords from the same visitor lock that visitor out for 15 minutes, even for the correct password. With Upstash configured the lockout is shared across servers; without it, it is per instance.
- **Lists** of Customers, Businesses, Enquiries and the Audit log, newest first, 50 per page, with simple search (phone numbers can be typed as `077 123 4567`, `0771234567` or `+263771234567`).
- **CSV export** of any table: the whole table, phone numbers in E.164, database column names as headers. Text a spreadsheet could run as a formula (starting `=`, `+`, `-`, `@`) is prefixed with an apostrophe; real E.164 numbers are left exact. Excel drops the leading `+` when it opens a CSV directly; use *Data > From Text/CSV* and set the phone column to Text.
- **GET STARTED link** under *Settings*; leave it empty to reset to the WhatsApp default.
- **Audit log (`admin_audit`):** every export (table and row count), settings change (old and new value) and sign-in. An export is recorded before any data is returned, and a settings change is saved together with its audit row, so neither can happen unrecorded. It holds no personal data.

## Security, SEO and quality

**Security headers** (in `next.config.ts`): Content-Security-Policy, HSTS (two years, all subdomains), `X-Frame-Options: DENY` with `frame-ancestors 'none'`, `nosniff`, a strict referrer policy, a locked-down Permissions-Policy and `Cross-Origin-Opener-Policy`. The CSP allows only this site and Cloudflare Turnstile. It does **not** use nonces, because a nonce would force every page to render per request and remove the static, cached home page. It therefore allows inline scripts (Next.js needs them); the site renders no user-supplied HTML and React escapes everything, so this is a low risk. No secrets are in client code; only `NEXT_PUBLIC_*` values reach the browser.

**SEO:** title `InstaTickets | One Platform. Every Ticket.`, the brief's meta description, canonical URLs, Open Graph and Twitter cards with a social image built from the full logo, `sitemap.xml`, `robots.txt` (blocks `/admin` and `/api/`), a web manifest and icons generated from `favicon.png`, and Organization structured data with the head office address. `/terms` and `/cookies` (placeholders) are left out of the sitemap.

**Accessibility:** mobile first, tap targets of at least 44 px, skip link, labelled fields with linked error messages, and a timer with an accessible name. Automated checks with axe-core (WCAG 2.2 AA plus best practices) found no violations on any public page at 360 px and 1280 px, including the open mobile menu and the 404 page. Text over the hero gradient was measured separately (lowest contrast 5.0:1).

**Lighthouse (mobile, production build):** Performance 96 to 98, Accessibility 100, Best Practices 100, SEO 100 on `/`, `/for-businesses`, `/contact`, `/help` and `/privacy`. Measured locally with the Cloudflare and Vercel Analytics requests blocked (neither is reachable from a local run). Re-run against the live domain once it is up.

**Tests:** `npm test` runs the suite, including phone validation and E.164 storage, duplicate-phone handling, consent defaults, the countdown switch at `2026-11-14T22:00:00Z`, notification failure not blocking a submission, the admin (session, lockout, export, audit, settings), and the content rules.

## Brand assets

Brand files live in `public/brand/` and are used as supplied. Vector replacements can be dropped into the same folder without code changes.

**`logo-full.png` note:** the supplied file reached the build as a WebP image (1800 x 540, with transparency). At the owner's approval it was saved as `logo-full.png` by a format change only: same 1800 x 540 pixels, no resizing, cropping or recolouring (checked pixel for pixel). It is not the original upload, so replace it with the original PNG if one is available.

Files generated from the supplied ones (allowed by the brief): `src/app/icon.png`, `src/app/apple-icon.png` and `public/brand/favicon-192.png` (smaller sizes of `favicon.png`), and `src/app/opengraph-image.png` / `twitter-image.png` (the full logo, scaled and centred on brand navy, never cropped or recoloured).
