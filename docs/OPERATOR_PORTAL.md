# Partner onboarding portal: setup and daily use

Spec: CR-002 Partner Onboarding Portal. This guide covers what to set up once, and how the team uses it.

**What runs where**

| Address | What it is | Who uses it |
|---|---|---|
| `operators.instatickets.co.zw` | Bus operator **expression of interest** form (public). Saves to the database, emails accounts@ and tich@, auto-replies from accounts@, adds a row to the Sheet tab *Expressions of interest*. Reference `EOI-0001`. | Anyone |
| `operators.instatickets.co.zw/partner` | **Partner Portal**, invite-only. Bus operators and event organisers complete KYC, settlement accounts per currency (USD, ZiG, ZAR, BWP), upload documents and signed agreements; organisers submit events. References `OP-0001`, `EO-0001`, events `EO-0001-E01`. | Invited partners |
| `operators.instatickets.co.zw/admin/partners` (also on www once it moves to Vercel) | Create partners, upload contract documents and sandbox credentials, invite, review, approve, record certification and go-live, review events. | Bullion staff |
| `…/admin/partner-documents` | Shared documents: Operator Agreement Master Terms, Organiser Agreement Master Terms, Integration Standard. | Bullion staff |

---

## Part A. One-time setup

Work top to bottom. Parts A1 to A3 are the same as the website handover (`docs/HANDOVER.md`) if they are not done yet.

### A1. Vercel: database, spam check, email, admin

- [ ] **Neon database** connected; `DATABASE_URL` set.
- [ ] **Tables:** nothing to run. Every Vercel build applies new database migrations automatically (`scripts/migrate-on-build.mjs`) when `DATABASE_URL` is set. A failed migration stops the build, so broken code never goes live.
- [ ] **Turnstile** keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`), with hostnames `www.instatickets.co.zw`, `instatickets.co.zw` **and `operators.instatickets.co.zw`**.
- [ ] **Resend** `RESEND_API_KEY`; domain `instatickets.co.zw` verified (records in A5). Every partner email is sent *from* accounts@instatickets.co.zw.
- [ ] `RATE_LIMIT_SALT`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (32+ characters).

### A2. Private file storage (new)

- [ ] Vercel > project > **Storage > Create > Blob**. Name it `partner-documents`, connect it to this project (Production and Preview). Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
- Files are stored **private**: nobody can open them by link. They are streamed only to the partner who owns them or to a signed-in admin, and every admin download is in the Audit log.

### A3. New settings (Vercel > Settings > Environment Variables)

| Variable | Value | Why |
|---|---|---|
| *(none: two-step sign-in)* | Turn it on in **Admin > Settings > Two-step sign-in**: scan the QR code with Google or Microsoft Authenticator and type a code. | Admin sign-in then needs a 6-digit code as well as the password. **Do this before the first partner submits**: the admin area shows bank details and IDs. If the phone is lost: in the Neon console SQL editor run `delete from admin_security;` and set it up again. (`ADMIN_TOTP_SECRET` in Vercel still works as an alternative.) |
| `CRON_SECRET` | Any long random string (`openssl rand -hex 24`) | Protects the daily reminder job (reminders on day 2 and day 5 after an invitation). |
| `OPERATOR_SHEET_URL`, `OPERATOR_SHEET_SECRET` | From Part A4 | Pipeline rows in the Google Sheet. |
| `PORTAL_URL` | **Preview only**: the preview address, e.g. `https://instatickets-website-git-…vercel.app` | So sign-in links in emails sent from a preview point at the preview. Leave unset in Production (it defaults to `https://operators.instatickets.co.zw`). |
| `PARTNER_SESSION_SECRET` | Optional, 32+ random characters | Signs partner sessions. If unset, it is derived from `ADMIN_SESSION_SECRET`. |

Redeploy after adding variables.

### A4. Google Sheet (owned by tembanitich@gmail.com)

If you already set up the sheet from the earlier guide, only step 2 and step 5 (new version) apply.

1. Create the sheet (sheets.new), name it **InstaTickets Onboarding Pipeline**.
2. **Extensions > Apps Script**: replace everything with `scripts/operator-sheet.gs`, Save.
3. **Project Settings > Script Properties**: `OPERATOR_SHEET_SECRET` = a long random password.
4. **Deploy > New deployment > Web app**: Execute as *Me*, Who has access *Anyone*. Authorize (Advanced > Go to … (unsafe) > Allow). Copy the URL ending `/exec`.
5. If it was deployed before: **Deploy > Manage deployments > pencil > Version: New version > Deploy** (the URL stays the same).

Check: opening the URL shows `{"ok":true,…}`. The script creates three tabs as data arrives: **Expressions of interest**, **Partners** (one row per partner, updated as its stage changes), **Events**. It never receives bank details, ID numbers or document links. Add your own columns (Owner, Notes …) freely.

### A5. DNS at Vertico

First check in Vertico which **nameservers** `instatickets.co.zw` uses: if they are Vertico's, add the records there; if they point to your hosting company, add them in that control panel. Do not change the existing `MX`, `@` or `www` records.

| Type | Name | Value | Priority |
|---|---|---|---|
| CNAME | `operators` | the value Vercel shows after you add the domain (Vercel > Settings > Domains > Add `operators.instatickets.co.zw`, Production) | |
| TXT | `resend._domainkey` | from Resend | |
| MX | `send` | from Resend (e.g. `feedback-smtp.eu-west-1.amazonses.com`) | 10 |
| TXT | `send` | from Resend (e.g. `v=spf1 include:amazonses.com ~all`) | |
| TXT | `_dmarc` | `v=DMARC1; p=none;` (only if none exists) | |

Check: Vercel shows the domain valid; Resend shows the domain verified; `https://operators.instatickets.co.zw` and `/partner/sign-in` open.

### A6. Mailboxes

- [ ] `accounts@instatickets.co.zw` (sender of all partner emails; replies land here) and `tich@instatickets.co.zw` exist.

### A7. Shared documents (Admin > Partner documents)

- [ ] **Operator Agreement: Master Terms and Schedules 2 to 6** (PDF). Needed before any bus operator can be invited.
- [ ] **Event and Sports Organiser Agreement: Master Terms**. Needed before any organiser can be invited.
- [ ] **InstaTickets Operator Integration Standard**. Attached to the email that goes to each bus operator's technical contact on submission.

Uploading a new version later replaces it for everyone who downloads it from then on.

### A8. Publish

The work is on branch `claude/operator-portal`. Merge it into `main` (the production branch); Vercel deploys automatically.

---

## Part B. Onboarding a bus operator

1. **Admin > Partners > NEW PARTNER.** Bus operator; registered and trading name; group; tick *Anchor Operator Addendum* for the CAG and InterAfrica groups; the **finance contact** you already have (name, email, phone). The finance contact's email is the one that signs in.
2. On the partner page: under **Sandbox access**, paste this operator's sandbox credentials exactly as the technical contact should receive them; under **Contract documents**, upload the **Order Form** (tailored rates) and, for anchors, the **Addendum**. All three are required before the invitation can go.
3. **SEND INVITATION.** The operator's finance contact receives a one-time link (valid 7 days). Reminders follow automatically on day 2 and day 5 if they have not submitted. *SEND A NEW SIGN-IN LINK* sends a fresh one at any time; partners can also request one on the sign-in page.
4. The operator completes the portal: company, ticketing system, **finance / operations / technical** contacts, **routes with fare currencies**, a **settlement account per currency**, two signatories, customer service, expiry dates, declarations, the document checklist, and the signed Master Terms and Order Form (and Addendum). Submit is blocked until everything is present.
5. **On submission:** the operator gets a receipt; accounts@ and tich@ get a summary (no bank details); the **technical contact receives the integration pack**: the Integration Standard attached and the sandbox credentials in the email (copy to accounts@), so the 7-day integration starts. If the credentials were removed before submission, the pack waits and the team email says so: enter them and press SEND INTEGRATION PACK.
6. **Review** (Admin > Partners > the operator): START REVIEW; check details and documents (routes under 6 months and expired dates are flagged). Either REQUEST CHANGES (with a note; the operator is emailed and can edit again) or countersign, upload the **Executed agreement**, and APPROVE.
7. **Integration:** MARK CERTIFIED once the sandbox certification passes, then MARK LIVE once approved. Enter the operator, its rates and currencies in the back office.

## Part C. Onboarding an event or sports organiser

1. NEW PARTNER > Event or sports organiser, organiser type, **main contact**. (No Order Form at this stage.)
2. SEND INVITATION. The organiser completes the portal: organisation, main / event-day / finance contacts, **selling currencies** and an account per currency, signatories, track record (or deposit/guarantee), tax clearance, declarations, documents and the signed Master Terms.
3. Review and APPROVE as for operators (executed agreement uploaded first).
4. Once approved, the organiser submits **each event** (SUBMIT A NEW EVENT): details, ticket classes with currency and face value, capacity, sales dates, gate control, insurance, and the event documents. Ticket quantities may not exceed licensed capacity.
5. On the event page: upload the **Event Order Form** and SEND EVENT ORDER FORM; the organiser signs and uploads it; upload the executed copy and **APPROVE FOR SALE**.

## Part D. Fees in other currencies

Fees in the Order Form are fixed in USD. For tickets sold in ZiG, ZAR or BWP, the fee is converted at the rate agreed on the day of the transaction. TN CyberTech Bank holds settlement accounts in all four currencies (confirmed in writing).

## Part E. Security notes

- Partner sign-in is by one-time email link; the link opens a page with a CONTINUE button, so email scanners that open links cannot use it up. Only a hash of each link is stored.
- Bank details and IDs are only in the database and private storage: never in emails, the Sheet or the CSV exports of the general admin lists.
- Every partner action in the admin, and every document download, is in **Admin > Audit log**.
- To sign every partner out: change `PARTNER_SESSION_SECRET` (or `ADMIN_SESSION_SECRET` if the former is unset) and redeploy.

## Part F. Test it live

1. Create a test bus operator with your own Gmail as the finance contact; upload any PDF as its Order Form; invite.
2. Open the email, CONTINUE, fill everything (two routes, three currencies), upload test PDFs, submit. Check the receipt, the team email, the Integration Standard email to the technical address, and the Sheet row.
3. Request changes, resubmit, upload an executed agreement, approve. Check the emails and that the Sheet row updated in place.
4. Afterwards set the test partner to Rejected (with a note) so it is clearly not real.
