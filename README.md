# InstaTickets pre-launch website

Public pre-launch site for InstaTickets (www.instatickets.co.zw). Next.js App Router, TypeScript (strict), Tailwind CSS. The full build brief is in [`docs/WEBSITE_BRIEF.md`](docs/WEBSITE_BRIEF.md).

> Status: **Phase 2 (countdown)**. Phase 1 (pages, brand, header, footer, WhatsApp button) and the countdown are in place. Working forms (Phase 3), admin (Phase 4) and SEO/security polish (Phase 5) are still to come. Until Phase 3 the three forms are laid out but their submit buttons are disabled.

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
