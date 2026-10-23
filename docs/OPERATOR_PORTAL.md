# Bus operator portal: setup guide

**What it is:** `operators.instatickets.co.zw` shows the bus operator registration page. Each registration:

1. is saved in the website database (Admin > Operators), with a reference number such as `OP-0001`;
2. is emailed to `accounts@instatickets.co.zw` and `tich@instatickets.co.zw` (reply goes straight to the operator);
3. gets an automatic reply to the operator, from `accounts@instatickets.co.zw`, with their reference number;
4. is added as a row to the Google Sheet owned by `tembanitich@gmail.com`.

Steps 2 to 4 never block the operator: if one fails, the registration is still saved and the failure shows in Vercel > Logs (search `operator submission`).

The page also works at `/operators` on the main site (useful on preview links). Other pages on the subdomain send visitors to `www.instatickets.co.zw`, except the Privacy, Terms and Cookie pages, which the subdomain serves itself.

Work through the parts in order. Each one says how to tell it worked.

---

## Part 0. The basics from the website handover (if not done yet)

The operator portal uses the same setup as the main site. If these are not done, do them first: `docs/HANDOVER.md` steps 2 to 4.

- [ ] **Database (Neon)** connected to the Vercel project, and `DATABASE_URL` set.
- [ ] **Tables created:** `npm run db:migrate` with the Neon connection string (see HANDOVER step 4). This also creates the new `operator_registrations` table. Safe to run again.
- [ ] **Cloudflare Turnstile** keys set (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).
- [ ] **Resend** API key set (`RESEND_API_KEY`).
- [ ] `RATE_LIMIT_SALT`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` set.

## Part 1. Mailboxes (your email host)

- [ ] `accounts@instatickets.co.zw` exists and can receive mail.
- [ ] `tich@instatickets.co.zw` exists and can receive mail.

*Check:* send a test email to each from your Gmail.

## Part 2. The Google Sheet (signed in as tembanitich@gmail.com)

1. Go to **sheets.new**. Name the sheet **InstaTickets Operator Registrations**.
2. **Extensions > Apps Script.** Delete everything in the editor, paste the whole of `scripts/operator-sheet.gs` from this repository, and click **Save**.
3. Click the **gear (Project Settings)** on the left. Under **Script Properties**, click **Add script property**:
   - Property: `OPERATOR_SHEET_SECRET`
   - Value: a long random password (30+ characters, letters and numbers). Keep a copy; you need it again in Part 3.
   Click **Save script properties**.
4. Click **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Description: `Operator registrations`
   - Execute as: **Me (tembanitich@gmail.com)**
   - Who has access: **Anyone**
   Click **Deploy**.
5. Google asks for permission. Click **Authorize access**, choose your account. If you see "Google hasn't verified this app", click **Advanced**, then **Go to … (unsafe)**. (It is your own script; this warning always appears for personal scripts.) Click **Allow**.
6. Copy the **Web app URL** (it ends in `/exec`).

*Check:* paste the Web app URL into a browser. You should see `{"ok":true,"message":"InstaTickets operator sheet is ready."}`.

"Anyone" only means the address can be called without a Google login; the script refuses every request that does not carry your secret, and it can only add rows. Nobody can read the sheet through it.

**If you ever edit the script:** Deploy > **Manage deployments** > pencil > Version: **New version** > Deploy. The URL stays the same.

The first registration creates the column headings, plus two empty columns, **Owner** and **Notes**, for the team. You can add more columns, colour rows, or change **Status** (New, Contacted, Meeting booked, Signed, Live) freely; the website only ever adds new rows at the bottom.

## Part 3. Vercel settings

In Vercel > **instatickets-website** > **Settings > Environment Variables**, add for **Production** and **Preview**:

- [ ] `OPERATOR_SHEET_URL`: the Web app URL from Part 2.
- [ ] `OPERATOR_SHEET_SECRET`: the same secret as in Part 2.

Then **Settings > Domains > Add domain**: type `operators.instatickets.co.zw`, environment **Production**. Vercel shows a **CNAME** record to add (Name `operators`, Value like `xxxx.vercel-dns-017.com` or `cname.vercel-dns.com`). **Copy the exact value Vercel shows**; you need it in Part 5.

## Part 4. Sending email from accounts@ (Resend)

1. In Resend > **Domains > Add Domain**: `instatickets.co.zw`. Region: the default is fine.
2. Resend lists 3 or 4 DNS records (usually a `TXT` named `resend._domainkey`, and an `MX` and a `TXT` named `send`). Keep this page open for Part 5.

These records use their own names (`resend._domainkey`, `send`), so they **do not touch** your existing email records.

## Part 5. DNS at Vertico

**First, confirm Vertico controls the DNS.** In Vertico, open the domain `instatickets.co.zw` and look at its **Nameservers**.
- If they are Vertico's own nameservers, add the records in Vertico's **DNS Management / DNS Zone** page (below).
- If they point to your hosting company (the one with your mailboxes and control panel), add the records in **that** control panel's DNS zone editor instead. Records added in the wrong place have no effect.
- If Vertico's panel has no DNS editor, email Vertico support with the table below and ask them to add the records.

**Add these records** (names are written without `.instatickets.co.zw`; most panels add it for you):

| Type | Name / Host | Value / Points to | Priority | TTL |
|---|---|---|---|---|
| CNAME | `operators` | the value Vercel showed in Part 3 | | 3600 (or default) |
| TXT | `resend._domainkey` | the long `p=...` value from Resend | | default |
| MX | `send` | the value from Resend (e.g. `feedback-smtp.eu-west-1.amazonses.com`) | 10 | default |
| TXT | `send` | the value from Resend (e.g. `v=spf1 include:amazonses.com ~all`) | | default |
| TXT | `_dmarc` | `v=DMARC1; p=none;` (**only if no `_dmarc` record exists already**) | | default |

**Do not change:** the existing `MX` records for `instatickets.co.zw` itself (they deliver your mail), the `@` record, or the `www` record. If the panel puts a trailing dot on CNAME values (`cname.vercel-dns.com.`), that is normal.

*Check (allow 10 minutes to a few hours):*
- Vercel > Settings > Domains shows `operators.instatickets.co.zw` as **Valid Configuration** with a certificate.
- Resend > Domains shows `instatickets.co.zw` as **Verified**.
- `https://operators.instatickets.co.zw` opens the registration page.

## Part 6. Cloudflare Turnstile

Cloudflare dashboard > **Turnstile** > your widget > **Settings > Hostnames**: add `operators.instatickets.co.zw`. Without it, the security check fails on the subdomain and nobody can submit.

## Part 7. Publish

The portal is on the branch `claude/operator-portal` (it sits on top of the latest website work on `claude/admiring-allen-96aj86`). The domain serves whatever is on the **production branch, `main`**. To publish: merge `claude/operator-portal` into `main` (GitHub > Pull requests > New, base `main`, compare `claude/operator-portal` > Merge). Vercel deploys `main` automatically.

## Part 8. Test it live (10 minutes)

On `https://operators.instatickets.co.zw`, register a test company using an email address you can read (your Gmail):

- [ ] The page says **THANK YOU** and shows a reference, e.g. **OP-0001**.
- [ ] `accounts@` and `tich@` each receive **New bus operator registration OP-0001**. Clicking Reply addresses the operator.
- [ ] Your Gmail receives **Your InstaTickets operator registration (OP-0001)** from `accounts@instatickets.co.zw`, in the **inbox, not spam**. Reply to it and check the reply lands in `accounts@`.
- [ ] A new row appears in the Google Sheet, with the mobile number starting `+263`.
- [ ] Admin > **Operators** lists it.
- [ ] Leave a required field empty: the form shows the message and keeps what you typed.
- [ ] `https://operators.instatickets.co.zw/privacy` opens the Privacy Notice.

Delete the test row from the sheet afterwards. (The database row stays; it is harmless, and its number is simply skipped.)

## Changing things later

- **Who gets the notifications / the auto-reply sender:** `OPERATOR_MAIL` in `src/lib/email.ts`.
- **Page wording, form questions, auto-reply text:** `operators` in `content/site.ts`.
- **Sheet stops updating:** Vercel > Logs, search `Google Sheet row`. The usual causes are a changed secret (Part 2 and Part 3 must match) or a script edited without a new deployment version.
