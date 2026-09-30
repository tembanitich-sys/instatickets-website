# InstaTickets pre-launch website

Public pre-launch site for InstaTickets (www.instatickets.co.zw). Next.js App Router, TypeScript (strict), Tailwind CSS. The full build brief is in [`docs/WEBSITE_BRIEF.md`](docs/WEBSITE_BRIEF.md).

> Status: **Phase 4 (admin)**. Pages, countdown, the three forms and the admin area are in place. SEO/security polish and the remaining docs (Phase 5) are still to come.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest (uses an in-memory Postgres, no database needed)
npm run lint
npx tsc --noEmit
npm run build
```

Copy `.env.example` to `.env.local` for local settings. Without `DATABASE_URL` the site still runs; the GET STARTED link falls back to WhatsApp.

Node 22 or newer is recommended.

## Changing copy

All page copy lives in [`content/site.ts`](content/site.ts) (brief Appendix A and B). Components read from it. Change wording there; you should not need to touch components.

The privacy notice (`/privacy`) keeps its unconfirmed values in square brackets, for example `[DATE PUBLISHED]`, and renders them highlighted so they cannot be missed. Replace them in `content/site.ts` once confirmed.

## Countdown

The launch instant is hard-coded in [`src/lib/countdown.ts`](src/lib/countdown.ts) as `2026-11-14T22:00:00Z` (00:00 on 15 November 2026 in Harare). The home page is re-rendered at most once a minute, so the server-rendered first value is close to current. In the browser the clock is corrected against `/api/now` (server time), so a wrong device clock cannot show the wrong countdown or switch to "live" early. At the launch instant the countdown is replaced by **INSTATICKETS IS NOW LIVE** and a **GET STARTED** button, with no redeploy needed.

**Previewing the after-launch state** (local development and Vercel preview deployments only; ignored in production):

- `/?launched=1` jumps to the launch instant.
- `/?now=2026-11-14T21:59:50Z` simulates that moment, then keeps counting, so you can watch the switch.

### GET STARTED link

Stored in the `site_settings` table under the key `get_started_url` and read at most once a minute. Only `https://` links are accepted. Default: the WhatsApp chat link. The admin page that edits it arrives in Phase 4.

## Forms

The customer pre-registration (home), business registration (`/for-businesses`) and contact (`/contact`) forms are Next.js server actions in [`src/app/actions.ts`](src/app/actions.ts). The logic is in `src/lib/forms/`. Every submission goes through the same steps, in this order:

1. parse and validate on the server with Zod (`schemas.ts`); phone numbers are checked with `libphonenumber-js` and stored in E.164 (for example `+263771234567`);
2. rate limit per visitor and form (5 per 10 minutes). The visitor's IP is hashed with `RATE_LIMIT_SALT` before it reaches the limiter and is never stored or logged;
3. return field messages if anything is invalid (without spending the one-time Turnstile token);
4. verify the Cloudflare Turnstile token server-side (fails closed);
5. store the record in Postgres;
6. only then send the notification email. A failed email is logged (without personal details) and never fails the submission.

If the database is unavailable the visitor gets an error; a submission is never reported as saved when it was not.

**Rules worth knowing**

- Marketing consent is never pre-ticked. It is stored as `marketing_consent` plus `marketing_consent_at` (null when not given). The privacy acknowledgement is required and the notice version (`2026-10-pre-launch`, in `content/site.ts`) is stored with every record.
- A pre-registration with a phone number already on file updates that record and shows the same success message. Latest submission wins for interests and marketing consent (unticked withdraws consent and clears the timestamp). A blank email never erases one already given, and the name and first campaign tags stay as first recorded.
- Business registrations always insert a new row. The contact form's phone is optional.
- Campaign tags (`utm_source`, `utm_medium`, `utm_campaign`) from the landing URL are remembered for the tab (session storage) and saved with the form.

**Notifications:** customer and business forms email `registrations@instatickets.co.zw`; the contact form emails `info@instatickets.co.zw`. Emails are plain text with fixed subjects. The sending domain must be verified in Resend (SPF/DKIM), and both mailboxes must exist.

### Environment variables

See [`.env.example`](.env.example) for the full list with comments. Turnstile's site key is inlined into the browser bundle at build time, so set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel **before** the deploy that should use it. Until real keys exist, Cloudflare's published test keys can be used.

## Admin (`/admin`)

A minimal admin area. It is not linked from the public site, sends `noindex` headers and meta tags, and is never cached.

- **Sign in** with `ADMIN_PASSWORD`. The sign-in form also uses Turnstile. The session is a signed cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, scoped to `/admin`, 8 hours). Changing `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` signs everyone out. If either is missing or too weak (password under 12 characters, secret under 32), sign-in is unavailable and the reason is written to the server log.
- **Lockout:** five wrong passwords from the same visitor lock that visitor out for 15 minutes, even for the correct password. Failed Turnstile checks do not count. Visitors are identified by a salted hash of their IP, never the IP itself. With Upstash configured the lockout is shared across all server instances; without it, it is kept per instance in memory, so set the Upstash variables for real protection.
- **Lists:** Customers, Businesses, Enquiries and the Audit log, newest first, 50 per page, with a simple search (case-insensitive, across names, emails, phone numbers and free text; phone numbers can be typed as `077 123 4567`, `0771234567` or `+263771234567`).
- **CSV export** of any table (the whole table, phone numbers in E.164, database column names as headers). Text that a spreadsheet could run as a formula (starting with `=`, `+`, `-`, `@`) is prefixed with an apostrophe; real E.164 numbers are left exactly as stored. Excel drops the leading `+` when it opens a CSV directly; use *Data > From Text/CSV* and set the phone column to Text to keep it.
- **GET STARTED link:** edit it under *Settings*. It must be an `https://` link; leaving it empty resets it to the WhatsApp default. It is live for visitors immediately, without a redeploy.
- **Audit log (`admin_audit`):** every CSV export (table and row count), every settings change (old and new value) and every successful sign-in is recorded. An export is recorded before any data is returned, and a settings change and its audit row are saved together, so neither can happen unrecorded. The log holds no personal data. It is read-only in the admin.

Admin screens use plain functional wording written for staff; the public copy stays in `content/site.ts`.

### Database migrations

Schema is in `src/lib/db/schema.ts`; migrations are checked in under `drizzle/`. With `DATABASE_URL` set to the Neon connection string:

```bash
npm run db:migrate     # apply migrations
npm run db:generate    # after changing the schema, create a new migration
```

Migrations are not run automatically during the Vercel build.

## Brand assets

Brand files live in `public/brand/` and are used as supplied. Drop vector replacements into the same folder without code changes.

**`logo-full.png` note:** the supplied file reached the build as a WebP image (1800 x 540, with transparency). At the owner's approval it was saved as `logo-full.png` by a format change only: same 1800 x 540 pixels, no resizing, cropping or recolouring (checked pixel for pixel). It is not the original upload, so replace it with the original PNG if one is available.

## Deployment

The Vercel project is imported from this repository. Function region is set in [`vercel.json`](vercel.json) to `cpt1` (Cape Town), the closest available region to Zimbabwe. Do not set it in the dashboard.

Environment variables, database setup and the Vertico DNS steps will be added in the later phases.
