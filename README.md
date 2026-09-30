# InstaTickets pre-launch website

Public pre-launch site for InstaTickets (www.instatickets.co.zw). Next.js App Router, TypeScript (strict), Tailwind CSS. The full build brief is in [`docs/WEBSITE_BRIEF.md`](docs/WEBSITE_BRIEF.md).

> Status: **Phase 1 (skeleton)**. Pages, brand, header, footer and WhatsApp button are in place. The countdown (Phase 2), working forms (Phase 3), admin (Phase 4) and SEO/security polish (Phase 5) are still to come. Until Phase 3 the three forms are laid out but their submit buttons are disabled.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

Node 22 or newer is recommended.

## Changing copy

All page copy lives in [`content/site.ts`](content/site.ts) (brief Appendix A and B). Components read from it. Change wording there; you should not need to touch components.

The privacy notice (`/privacy`) keeps its unconfirmed values in square brackets, for example `[DATE PUBLISHED]`, and renders them highlighted so they cannot be missed. Replace them in `content/site.ts` once confirmed.

## Brand assets

Brand files live in `public/brand/` and are used as supplied. Drop vector replacements into the same folder without code changes.

**`logo-full.png` note:** the supplied file reached the build as a WebP image (1800 x 540, with transparency). At the owner's approval it was saved as `logo-full.png` by a format change only: same 1800 x 540 pixels, no resizing, cropping or recolouring (checked pixel for pixel). It is not the original upload, so replace it with the original PNG if one is available.

## Deployment

The Vercel project is imported from this repository. Function region is set in [`vercel.json`](vercel.json) to `cpt1` (Cape Town), the closest available region to Zimbabwe. Do not set it in the dashboard.

Environment variables, database setup and the Vertico DNS steps will be added in the later phases.
