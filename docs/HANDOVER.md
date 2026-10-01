# InstaTickets website: handover checklist

Everything in the brief is built, tested and deployed. What is left is **setup that only you can do** (accounts, keys, DNS, a few decisions), then a live check. Work through this top to bottom; each step says where to do it and how to tell it worked. The README has the detail behind each step.

**Status when this was written**

| | |
|---|---|
| Repository / branch | `tembanitich-sys/instatickets-website`, production branch `main` |
| Preview | https://instatickets-website-git-clau-7a6316-tembanitich-6405s-projects.vercel.app/ |
| Tests | 108 pass; lint, type check and build clean; Vercel install and build log has no warnings |
| Lighthouse (mobile, local) | Performance 96 to 98; Accessibility, Best Practices, SEO 100 |
| Accessibility (axe, WCAG 2.2 AA) | no violations on any public page |
| Live forms and admin | **not yet working on Vercel**: they need steps 2 to 4 below |

---

## 1. Fix the Vercel project (10 minutes)

- [ ] **Create a `main` branch** in the GitHub repository and make it the **default branch**.
- [ ] In Vercel, **Settings > Environments (or Git) > Production Branch** = `main`.
  *Why:* today the only branch is treated as production, so every "preview" is labelled production, and the `?launched=1` preview of the after-launch state is switched off on it.
  *Check:* push a change to the working branch; Vercel labels that build **Preview**, not Production.
- [ ] **Settings > Build & Deployment > Framework Preset = Next.js** (it currently says "Other"; `vercel.json` covers for it, so this is tidying, not urgent).
- [ ] Merge `claude/admiring-allen-96aj86` into `main` when you are happy (there is no pull request yet; ask if you want me to open one).

## 2. Create the accounts (30 to 45 minutes)

- [ ] **Database: Neon**, from the Vercel Marketplace, connected to this project. Pick the region closest to Cape Town that Neon offers. The integration normally adds `DATABASE_URL` to the project; confirm it exists and is the **pooled** connection string.
- [ ] **Spam protection: Cloudflare Turnstile.** In the Cloudflare dashboard create a widget. Add these hostnames: `www.instatickets.co.zw` and `instatickets.co.zw`. Keep the **site key** and **secret key**.
- [ ] **Email: Resend.** Add and verify `instatickets.co.zw` as a sending domain (Resend shows SPF and DKIM records, added in step 5). Create an API key.
- [ ] **Rate limiting: Upstash Redis** (Vercel Marketplace). This is optional but recommended, because without it the admin lockout and form limits only count per server. If the integration names its variables differently (for example `KV_REST_API_URL`), copy the values into the two names the code reads, shown in step 3.
- [ ] **Mailboxes exist:** `info@instatickets.co.zw` and `registrations@instatickets.co.zw` can receive mail. The site emails them; a missing mailbox means the notifications bounce.

## 3. Set the environment variables

In Vercel: **Settings > Environment Variables**, for **Production** (and Preview if you want previews to work fully).

- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: the Turnstile site key. **Set this before the next deploy**; it is baked into the page at build time.
- [ ] `TURNSTILE_SECRET_KEY`: the Turnstile secret key.
- [ ] `DATABASE_URL`: from Neon (step 2).
- [ ] `RESEND_API_KEY` and `EMAIL_FROM`, for example `InstaTickets Website <website@instatickets.co.zw>`.
- [ ] `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- [ ] `RATE_LIMIT_SALT`: any long random string (`openssl rand -hex 24`). Keep a copy somewhere safe.
- [ ] `ADMIN_PASSWORD`: at least 12 characters; a long passphrase is best. This is the only thing protecting the admin.
- [ ] `ADMIN_SESSION_SECRET`: 32 or more random characters (`openssl rand -hex 32`).
- [ ] **Redeploy** (Deployments > the latest > Redeploy) so the site key is built in.

*Until real Turnstile keys exist, Cloudflare's test keys work but give no spam protection:* site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`. **Do not launch on the test keys.**

## 4. Set up the database and analytics

- [ ] **Create the tables.** On any computer with Node 22 and this repository:
  ```bash
  npm install
  DATABASE_URL="<the Neon connection string>" npm run db:migrate
  ```
  *Check:* it prints `Migrations applied.` Running it again is safe.
  *New (Agent Network):* migration `0003_agent_applications.sql` creates the `agent_applications` table. If the database already existed, **run this command again** so the new table is created; until then the /agents form cannot store applications.
- [ ] **Enable Web Analytics:** Vercel project > **Analytics** tab > *Enable*. The script is already on the site. Until you enable it the script returns a 404, which shows up as a console error and costs Lighthouse Best Practices points.

## 5. Point the domain at Vercel (DNS is at Vertico)

Full detail is in the README under *Pointing the domain at Vercel*.

- [ ] In Vercel **Settings > Domains**, add `www.instatickets.co.zw` (make it primary) and `instatickets.co.zw` (let it redirect to `www`). Vercel shows the exact records; copy the values from that screen.
- [ ] **A day early:** at Vertico, lower the TTL on the records you will change (300 seconds) so a mistake is quick to undo.
- [ ] At Vertico add: `CNAME www` to the target Vercel shows (for example `cname.vercel-dns-0.com`), and `A @` to `76.76.21.21`. **Replace** any existing `www` or `@` record; do not add a second one. **Do not touch the `MX` records** (they deliver your mail).
- [ ] Add the **Resend** records (SPF, DKIM, optional DMARC) exactly as Resend shows them. A domain may have only one SPF `TXT` record, so merge Resend's `include:` into an existing one instead of adding another.
- [ ] Wait (minutes to a few hours). *Check:* Vercel shows the domain as valid with a certificate; `https://www.instatickets.co.zw` loads; `https://instatickets.co.zw` redirects to it; `/robots.txt` and `/sitemap.xml` show `www.instatickets.co.zw`; Resend shows the domain as verified.

## 6. Decisions and text only you can supply

All in `content/site.ts` (edit, commit, push; no other file needs touching).

**A. The privacy notice has no `[brackets]` left.** Effective date 1 October 2026, operator "Bullion Technologies (Pvt) Ltd", all retention periods 12 months and the response time 30 days are filled in (`privacy` in `content/site.ts`). A test fails the build if a highlighted bracket reappears on the notice. The retention periods are only promises in the text: nothing deletes records automatically (see section 9).

**B. Wording I had to write because the brief has none.** Confirm or replace:

- [ ] Contact form: the `SEND MESSAGE` button (`contactPage.form.button`) and the success message *"THANK YOU. YOUR MESSAGE HAS BEEN SENT. An InstaTickets representative will get back to you."* (`contactSuccess`).
- [ ] Form error messages (`formMessages`), for example "Enter a valid mobile number for the selected country."
- [ ] The 404 page text (`notFoundPage`), the "Skip to content" link and the "(optional)" label (`ui`).
- [ ] Admin screen wording (in `src/components/admin/` and `src/app/admin/`); staff-only, low priority.

**A2. Privacy notice changes for the Agent Network.** "What we collect", "Why we use it" and "How long we keep it" now cover Agent applications, and `PRIVACY_NOTICE_VERSION` is now `2026-10-01-final` (stored with every new record; older rows keep their earlier version). Check the wording with whoever advises on data protection.

**B2. Agent Network wording to confirm** (all in `content/site.ts`: `home.inPerson`, `agents`, the Help FAQ "How do I become an InstaTickets Agent?"). The site deliberately states **no commission rates, amounts, earnings examples or guaranteed income**, and a test (`tests/content-rules.test.ts`) fails the build if any appear. The form collects no ID numbers, bank details or documents.

**B3. Brand.** All logos are interim stand-ins; designer versions will replace them later under the same file names. `logo-full.png` is now 1800 x 521 and reads "A BULLION TECHNOLOGIES PRODUCT"; if the designer's version has a different height, update `width`/`height` in `Hero.tsx`, regenerate `src/app/opengraph-image.png` and `twitter-image.png`, and the brief's Section 5 table.

**C. Legal pages.** `/terms` and `/cookies` say COMING SOON, as the brief asks, and no legal text was written. The privacy notice says "See the Cookie Policy", which currently says COMING SOON. Decide whether the Cookie Policy must exist before launch (the site itself sets no cookies; the admin session cookie is only set when staff sign in).

**D. Launch offers.** The "may qualify for launch promotions, discounts and special offers" wording is used exactly as in the brief. Nothing on the site promises a specific discount.

## 7. Test it live (20 minutes)

On the real domain, once steps 1 to 5 are done:

- [ ] **Pre-register** on the home page with your own number. Expected: "YOU'RE ON THE LIST." A row appears in the admin, and an email arrives at `registrations@`.
- [ ] **Register again** with the same number written differently (`0771234567` vs `+263771234567`). Expected: the same success message, **still one row**.
- [ ] **Business form**, **Agent form** (`/agents`) and **contact form**: each shows its success message, saves a row, and emails the right mailbox (`registrations@` for business and agents, `info@` for contact). Submitting the Agent form twice gives **two rows**.
- [ ] **Bad input:** a wrong phone number and a missing privacy tick show field messages and keep what you typed.
- [ ] **Admin** at `/admin`: sign in; lists (including **Agents**) show newest first; search finds a number typed as `077 123 4567`; **Export CSV** downloads with `+263...` numbers; the Audit log shows your export and sign-in. Sign out and confirm `/admin` sends you to the sign-in page.
- [ ] **Wrong password five times** locks you out for 15 minutes (do this last, and expect to wait).
- [ ] **GET STARTED link:** Admin > Settings: enter an `https://` link, save; view page source or a launched preview to see it in use. **Clear the field to reset it to WhatsApp.**
- [ ] **Countdown:** matches Harare time (00:00 on 15 November). On a **preview** deployment (not production) open `/?now=2026-11-14T21:59:50Z` and watch it flip to **INSTATICKETS IS NOW LIVE** with a **GET STARTED** button.
- [ ] **Speed and quality:** run PageSpeed Insights (pagespeed.web.dev) on `https://www.instatickets.co.zw` for mobile. Target: all four scores at least 90. Local results were 96 to 98 for Performance and 100 for the rest.
- [ ] **Share preview:** paste the site address into WhatsApp; it should show the InstaTickets logo card and the title.

## 8. Launch day (15 November 2026)

- [ ] Earlier that week: Admin > Settings: set the **GET STARTED** link (or leave the WhatsApp default). It applies immediately with no redeploy, so it can also be changed on the day.
- [ ] Confirm the real Turnstile keys are in place (not the test keys), and the privacy notice has no `[brackets]` left.
- [ ] Do not deploy code in the last hour before launch unless it is a fix.
- [ ] **00:00 Harare time:** the countdown switches to **INSTATICKETS IS NOW LIVE** by itself, for every visitor, whatever their device clock says. Check it on a phone.
- [ ] Export the customer and business lists (Admin > each list > Export) before launch as a backup and to plan the "verify your number and activate your account" invitations.

## 9. After launch: not built (outside the brief)

- **Deleting old data.** The privacy notice promises deletion after the retention periods. Nothing deletes records automatically; someone needs to do it (or ask for a scheduled clean-up to be built).
- **Sending launch messages.** The site stores who ticked marketing consent (`marketing_consent`, with the time). It does not send SMS, WhatsApp or email campaigns.
- **Turning pre-registrations into accounts.** Numbers are stored in E.164, ready to import, but there is no link to the back office.
- **Agent appointments.** The site only collects applications (admin > Agents). Review, requirements, terms, agreements and onboarding happen outside the website.
- **Data requests.** People email `info@instatickets.co.zw` or WhatsApp; someone has to find and delete or correct their row (search the number in the admin; deleting is done in the database).

## 10. Keeping an eye on it

- **Email failures:** Vercel > project > **Logs**; search for `Notification email`. A failure never blocks the visitor, so this is the only place it shows. The record is always saved.
- **Admin activity:** Admin > Audit log (every export, settings change and sign-in).
- **Signing everyone out of the admin:** change `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` and redeploy.
- **Suspected admin password leak:** change `ADMIN_PASSWORD`, redeploy, then look at the Audit log for exports you do not recognise.

## 11. Known limitations to be aware of

- **Content Security Policy allows inline scripts.** A stricter nonce-based policy would make every page render per request and remove the fast static home page. The site renders no user-supplied HTML, so the risk is low; the README explains it.
- **Without Upstash,** the admin lockout and form rate limits are kept per server in memory, so a determined attacker gets more attempts. Set Upstash before relying on them.
- **`logo-full.png` is not the original file.** It reached the build as a WebP; it was saved as a PNG with identical pixels (approved). Replace it with the original PNG if you have it; nothing else needs to change.
- **Excel drops the `+`** from phone numbers when it opens a CSV directly. Import the column as Text (README explains).
- **`x-robots-tag: noindex`** on the `vercel.json` preview address is Vercel's own; it will not apply on `www.instatickets.co.zw`.
- **Notification emails are plain text** with fixed subjects (a deliberate safety choice).

---

## Quick reference

| | |
|---|---|
| Public site | `/`, `/for-businesses`, `/agents`, `/help`, `/contact`, `/privacy`, `/terms`, `/cookies` |
| Admin | `/admin` (not linked anywhere; bookmark it) |
| Change wording | `content/site.ts` |
| Countdown target | `src/lib/countdown.ts`: `2026-11-14T22:00:00Z` |
| Database tables | `customer_preregistrations`, `business_registrations`, `agent_applications` (new, migration `0003`), `contact_enquiries`, `site_settings`, `admin_audit` |
| Notifications go to | customers, businesses and agent applications: `registrations@instatickets.co.zw`; contact form: `info@instatickets.co.zw` |
| Function region | `cpt1` (Cape Town), set in `vercel.json` |
| Run locally | `npm install`, `npm run dev`, `npm test` |
| Create or update tables | `DATABASE_URL=... npm run db:migrate` |
| New migration after a schema change | `npm run db:generate` (drizzle-kit is a devDependency) |
| Full detail | `README.md` and the original brief in `docs/WEBSITE_BRIEF.md` |
