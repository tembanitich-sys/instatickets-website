# InstaTickets Pre-Launch Website: Claude Code Development Brief

**Project:** new Vercel project `instatickets-website` (separate from `instatickets-backoffice`)
**Domain:** www.instatickets.co.zw (registered at Vertico; DNS managed at Vertico, pointed to Vercel)
**Launch:** 15 November 2026, 00:00 Harare time (CAT, UTC+2)
**Place this file at:** `docs/WEBSITE_BRIEF.md`. Put brand files in `public/brand/` (Section 5).

---

## 1. Your role

Build the official pre-launch website for InstaTickets, a digital ticketing aggregation and distribution platform in Zimbabwe. The site has three jobs:

1. Build anticipation for the platform launch on 15 November 2026.
2. Collect customer pre-registrations.
3. Collect business leads from bus operators, event organisers, sports organisations, venues and existing ticketing platforms.

It is the public front door of a larger platform, not a temporary coming-soon page. Do not build booking, customer accounts or a partner portal.

All page copy is in **Appendix A** and the privacy notice is in **Appendix B**. Use that text as written. Do not rewrite, extend or invent copy.

## 2. How to work

1. Read this brief in full before writing code.
2. Post a short plan: file structure, data model, the services you will use and any environment variables. Then stop and wait for approval.
3. Build in the phase order in Section 10. Each phase ends with a working preview deployment.
4. Keep all copy in one file, `content/site.ts`, so wording can be changed without touching components.
5. Stop and ask when this brief is silent or ambiguous. Do not guess on legal text, prices, partners or claims.

## 3. Stack

| Area | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, strict mode |
| Styling | Tailwind CSS with brand tokens (Section 5) |
| Hosting | Vercel; choose the function region closest to Zimbabwe that is available |
| Database | Postgres through the Vercel Marketplace (e.g. Neon); migrations checked into the repo |
| Email notifications | Resend (or equivalent) from a verified instatickets.co.zw sending domain |
| Spam protection | Cloudflare Turnstile on every form, verified server-side |
| Validation | Zod on the server for every form; `libphonenumber-js` for phone numbers |
| Analytics | Vercel Web Analytics (cookieless) |

If you believe a different choice is clearly better, say so in your plan with the reason. Do not add a CMS.

## 4. Site structure

**Home** (long scroll): Hero and countdown, What you can find, Bus, Events, Sports, How it works, Pre-registration, Launch offers, Be part of the launch, About.

**Separate pages:** `/for-businesses` (business form, integration, Build with InstaTickets), `/help` (FAQ), `/contact`, `/privacy` (Appendix B), `/terms` and `/cookies` (placeholder pages that say COMING SOON; do not write legal text).

**Header:** compact logo left. Menu: Home, Bus, Events, Sports, For Businesses, Help, Contact (Bus, Events and Sports scroll to Home sections). One button on the right: JOIN INSTATICKETS, linking to pre-registration. No Sign In. Hamburger menu on mobile.

**Primary calls to action:** JOIN INSTATICKETS (customer) and REGISTER YOUR BUSINESS (business). All other buttons use secondary styling.

**WhatsApp:** floating button on every page plus in-page buttons labelled CHAT ON WHATSAPP, linking to `https://wa.me/263772270533`. Never display the raw URL.

## 5. Brand

Files in `public/brand/`:

| File | Size | Use |
|---|---|---|
| `logo-full.png` | 1800 x 540 px, transparent | Hero and footer |
| `logo-compact.png` | 1028 x 195 px, transparent | Header and mobile |
| `favicon.png` | 512 x 512 px, transparent | Favicon, Apple touch icon, web manifest (generate the smaller sizes from it) |
| `bullion-full.png` | 1157 x 532 px, transparent | Footer, beside "A BULLION TECHNOLOGIES COMPANY" |
| `bullion-compact.png` | 771 x 325 px, transparent | Small placements, e.g. next to the gold company line |

Use the logos exactly as supplied. Never redraw, crop, recolour or recreate them in CSS or SVG. Use `next/image` with correct width and height and priority loading for the hero logo.

Placement rules:
- Place the Bullion Technologies logos on white or very light backgrounds only. Their grey pixel squares disappear on navy.
- The InstaTickets logos have their own white ticket body and may sit on white or navy.
- These files are interim raster assets. Keep all brand files in `public/brand/` so vector replacements can be dropped in later without code changes.

Colour tokens:

| Token | Hex | Use |
|---|---|---|
| `navy` | #002F6C | Primary |
| `red` | #E10600 | Primary, main CTAs |
| `gold` | #D4AF37 | Bullion Technologies identification only |
| `white` | #FFFFFF | Main background |

Style: premium, modern, digital, trustworthy, African, technology-led. Clean cards, subtle shadows, strong typography, generous spacing. Minimal photography; prefer icons and graphic treatments. It must not look like a generic bus company or events site. Text on coloured backgrounds must meet WCAG AA contrast.

## 6. Countdown

- Target instant: `2026-11-14T22:00:00Z` (00:00 on 15 November in Harare). Hard-code this instant; never derive it from the visitor's time zone.
- Show DAYS, HOURS, MINUTES, SECONDS, updating every second on the client, with a server-rendered first value so there is no layout jump.
- After the target instant, replace the countdown with **INSTATICKETS IS NOW LIVE** and a **GET STARTED** button.
- The GET STARTED link is stored as a setting in the database and editable from the admin page (Section 8), so it can be changed on launch day without a redeploy. Default: the WhatsApp link.
- Provide a way to preview the after-launch state in development (e.g. a query parameter that only works outside production).

## 7. Forms and data

Three forms, all as server actions or route handlers. Every submission must:

- validate on the server with Zod and reject invalid input with clear field messages;
- verify the Turnstile token server-side;
- be rate-limited per IP;
- store the record in Postgres before sending any email;
- send a notification email (to registrations@ or info@ as below) and never fail the submission if email sending fails; log the failure instead;
- show the success message from Appendix A.

**Phone numbers:** country code selector defaulting to +263. Validate with `libphonenumber-js` and store in E.164 format (e.g. `+263771234567`). Reject invalid numbers. This matches the phone-keyed customer identity of the InstaTickets platform, so these records can later be imported as customer profiles.

**Consent:** marketing consent checkbox is unticked by default. Store `marketing_consent` (boolean) and `marketing_consent_at` (timestamp, null if not given). The privacy acknowledgement is required; store `privacy_notice_version` (e.g. `2026-10-pre-launch`).

**Duplicates:** a customer pre-registration with a phone number already on file updates that record (interests, email, consent) instead of creating a new one, and shows the same success message. Do not reveal to the visitor that the number already existed.

**Tables:**

| Table | Key fields |
|---|---|
| `customer_preregistrations` | id, first_name, last_name, phone_e164 (unique), email (nullable), interests (bus/events/sports), marketing_consent, marketing_consent_at, privacy_notice_version, utm_source, utm_medium, utm_campaign, created_at, updated_at |
| `business_registrations` | id, organisation_name, contact_person, phone_e164, email, business_type, offerings, has_ticketing_system (yes/no/not_sure), ticketing_system_name, website, details, marketing_consent, marketing_consent_at, privacy_notice_version, utm fields, created_at |
| `contact_enquiries` | id, name, email, phone_e164, enquiry_type, message, privacy_notice_version, created_at |
| `site_settings` | key, value, updated_at, updated_by (holds the GET STARTED link) |

**Routing of notifications:**

| Form | Notify |
|---|---|
| Customer pre-registration | registrations@instatickets.co.zw |
| Business registration | registrations@instatickets.co.zw |
| Contact | info@instatickets.co.zw |

Never store IP addresses in plain text. If you need them for rate limiting, keep them only in the rate limiter.

## 8. Admin page

A minimal `/admin` area, not linked from the public site and excluded from search engines:

- protected by a password stored in an environment variable, with a signed session cookie; lock out after repeated failed attempts;
- lists each table newest first with simple search;
- CSV export per table (phone numbers in E.164);
- an edit field for the GET STARTED link;
- every export and settings change is recorded in an `admin_audit` table (action, time, details).

## 9. Quality, SEO and security

- Mobile first: design at 360 px wide first; tap targets at least 44 px; forms usable one-handed.
- Lighthouse on mobile: Performance, Accessibility, Best Practices and SEO each at least 90.
- SEO: title `InstaTickets | One Platform. Every Ticket.`; meta description `InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with Bus, Events and Sports ticket inventory.`; Open Graph image made from the full logo; `sitemap.xml`; `robots.txt` that blocks `/admin`; Organization structured data with the head office address. Use the keywords from Appendix A naturally, never stuffed.
- Security headers (Content Security Policy, HSTS, frame protection). No secrets in client code.
- A `README.md` explaining environment variables, how to run locally, how to change copy in `content/site.ts`, and how to add the DNS records at Vertico to point the domain at Vercel.

## 10. Phase order

| Phase | Scope |
|---|---|
| 1. Skeleton | Project setup, brand tokens, layout, header, footer, all pages with copy from Appendix A, WhatsApp button, preview deployment |
| 2. Countdown | Countdown and after-launch state, settings table |
| 3. Forms | Three forms, database, validation, Turnstile, rate limiting, notifications, success states |
| 4. Admin | Admin login, lists, CSV export, GET STARTED setting, audit |
| 5. Polish | SEO, security headers, accessibility, Lighthouse targets, README, DNS instructions |

**Acceptance for the whole build:**

- every item in Section 11 holds;
- automated tests cover phone validation and E.164 storage, duplicate phone handling, consent defaults, the countdown switch at `2026-11-14T22:00:00Z`, and notification failure not blocking a submission;
- the site deploys on Vercel without errors or warnings.

## 11. Content rules (must hold everywhere)

- Do not mention any payment provider or mobile wallet by name.
- Do not invent operators, event organisers, partners, routes, prices, discounts, customer numbers, transaction volumes, testimonials, regulatory approvals, API specifications, legal text or social media accounts.
- Do not claim market leadership, or that InstaTickets owns ticket inventory.
- Do not claim any ticketing system can integrate automatically.
- Do not describe Events or Sports as "coming soon", and do not claim specific events or sports are already on sale.
- Do not display any person's name or personal email address.

## 12. Out of scope

Booking, payments, customer login, partner portal, a real developer portal or API, a CMS, and any integration with the InstaTickets back office.

---

## Appendix A: Page copy

### Home

**1. Hero**
Headline: ONE PLATFORM. EVERY TICKET.
Subheading: Discover, connect and access tickets through InstaTickets.
Category line: BUS | EVENTS | SPORTS
Launch line: LAUNCHING 15 NOVEMBER 2026
Countdown directly below.
Buttons: JOIN INSTATICKETS (primary), REGISTER YOUR BUSINESS (secondary).

**2. What can you find on InstaTickets?** (three equal cards)
BUS: Find and book available bus journeys from participating operators.
EVENTS: Concerts, festivals, fun runs, conferences, shows and more. Organisers: list your event on InstaTickets.
SPORTS: Football, rugby, cricket, athletics, motorsport and more. Sports organisations: list your fixtures on InstaTickets.

**3. Bus tickets**
Find participating bus services and access ticket inventory through InstaTickets.
Button: EXPLORE BUS TICKETS (links to pre-registration until launch).
Operators: bring your routes to InstaTickets. Link: REGISTER YOUR BUSINESS.

**4. Events**
Concerts, festivals, fun runs, conferences, shows, community events and other ticketed experiences can connect with InstaTickets.
Organisers: list your event on InstaTickets and reach customers across our distribution channels.
Button: REGISTER YOUR EVENT (links to the business form).
Visual: a range of event types, not music only.

**5. Sports**
InstaTickets is designed to support ticketing across many sports, including football, rugby, cricket, athletics, motorsport, basketball, tennis and combat sports.
Sports organisations: list your fixtures and events on InstaTickets.
Button: REGISTER YOUR SPORTING EVENT (links to the business form).
Visual: several sports, not football only.

**6. How InstaTickets works**
For customers: DISCOVER (find tickets from participating providers), SELECT (choose your journey, event or fixture), BOOK (complete your purchase through supported channels), ACCESS (receive and manage your ticket).
For businesses: REGISTER, VERIFY, CONNECT, PUBLISH. Participating businesses register, complete verification, connect their ticket inventory and publish through InstaTickets, subject to approval and technical requirements.

**7. Get ready for InstaTickets** (customer pre-registration)
Pre-register before launch to be among the first to hear when InstaTickets goes live. Registered users may qualify for launch promotions, discounts and special offers from participating ticket providers.
Fields:
- First Name (required)
- Last Name (required)
- Mobile Number with country code selector, default +263 (required)
- Email Address (optional)
- Interested in: Bus, Events, Sports (tick any)
- Checkbox, unticked: I would like to receive InstaTickets launch updates, offers and promotions by SMS, WhatsApp or email.
- Checkbox, required: I have read the InstaTickets Pre-Launch Privacy Notice. (link to /privacy)
Button: PRE-REGISTER
Success: YOU'RE ON THE LIST. Thank you for pre-registering. When InstaTickets launches, we'll invite you to verify your number and activate your account.

**8. Launch offers & promotions**
Participating providers may offer launch promotions and discounts to registered InstaTickets users.
Button: JOIN INSTATICKETS

**9. Be part of the InstaTickets launch**
InstaTickets launches on 15 November 2026. Customers can pre-register now. Businesses can register their interest and start the partner conversation.
Buttons: JOIN INSTATICKETS, REGISTER YOUR BUSINESS.

**10. About InstaTickets**
InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with ticket inventory across multiple categories and participating ticketing systems. It brings ticket providers, ticketing platforms and customers together in one connected digital ecosystem.
InstaTickets is a Bullion Technologies company.

### For Businesses

Headline: PUT YOUR TICKETS ON INSTATICKETS
InstaTickets connects ticket inventory with customers through a growing distribution ecosystem.
For: Bus Operators, Event Organisers, Sports Organisations, Venues, Existing Ticketing Platforms, Technology Partners.

**Already have a ticketing system?**
Connect your ticketing system to InstaTickets. You do not necessarily need to replace it. If your system meets InstaTickets integration requirements, your ticket inventory may be connected to the platform, subject to integration requirements and approval.
Buttons: BECOME AN INSTATICKETS PARTNER, INTEGRATION ENQUIRY.

**Have tickets to sell?** (business registration form)
Register your business to explore becoming an InstaTickets partner. This is an expression of interest, not a full application.
Fields:
- Organisation Name (required)
- Contact Person (required)
- Mobile Number with country code selector, default +263 (required)
- Email Address (required)
- Business Type: Bus Operator, Event Organiser, Sports Organisation, Venue, Existing Ticketing Platform, Other
- What would you like to offer through InstaTickets? Bus Tickets, Event Tickets, Sports Tickets, Other (tick any)
- Do you already have a ticketing system? Yes, No, Not sure
- Ticketing system or provider name (optional)
- Website (optional)
- Tell us about your tickets (optional, multi-line). Hint: routes, event name and date, venue, expected capacity, ticket types.
- Checkbox, unticked: I would like to receive InstaTickets updates by email.
- Checkbox, required: I have read the InstaTickets Pre-Launch Privacy Notice.
Button: REGISTER MY BUSINESS
Success: THANK YOU. YOUR REGISTRATION HAS BEEN RECEIVED. An InstaTickets representative may contact you to discuss onboarding, verification, ticket inventory and integration requirements.

**Build with InstaTickets**
Ticketing platforms and technology providers can explore integration with InstaTickets. Planned developer resources include API documentation, integration guides, a sandbox, authentication, inventory and booking integration, ticket issuance, webhooks, and testing and certification.
Button: REGISTER YOUR INTEREST (links to the business form).

### Help (FAQ)

- **What is InstaTickets?** A digital platform that brings bus, event and sports tickets from participating providers into one place.
- **When does it launch?** 15 November 2026.
- **Is pre-registration free?** Yes.
- **Does pre-registering create my account?** Not yet. It reserves your place for launch updates. At launch we'll invite you to verify your number and activate your account.
- **I run a ticketing system. Do I have to replace it?** Not necessarily. Systems that meet our integration requirements may be connected, subject to approval.
- **Who is behind InstaTickets?** InstaTickets is a Bullion Technologies company.
- **How do I get help?** Chat with us on WhatsApp or use the contact form.

### Contact

Headline: GET IN TOUCH
Email: info@instatickets.co.zw
Mobile: +263 771 802 240, +263 719 802 240
Telephone: +263 242 762014, +263 242 762016, +263 242 762024, +263 242 762026
WhatsApp button: CHAT ON WHATSAPP
Head Office: 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe
Form: Name, Email, Phone, Enquiry Type (General Enquiry, Business Partnership, Bus Operator, Event, Sports, Ticketing System Integration, Technical, Other), Message, required Privacy Notice checkbox.
Note: To register a business, please use the business registration form. (link)

All phone numbers are `tel:` links; the email is a `mailto:` link.

### Footer (every page)

Full logo. ONE PLATFORM. EVERY TICKET. BUS | EVENTS | SPORTS. A BULLION TECHNOLOGIES COMPANY (gold, with Bullion logo).
Links: Home, Bus, Events, Sports, For Businesses, Join InstaTickets, Help, Contact.
Contact: info@instatickets.co.zw, WhatsApp +263 772 270 533, +263 771 802 240, +263 719 802 240, 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe.
Legal: Pre-Launch Privacy Notice, Terms & Conditions (COMING SOON), Cookie Policy (COMING SOON).
© 2026 InstaTickets. All rights reserved.

---

## Appendix B: Pre-launch privacy notice (`/privacy`)

Publish exactly as below once the bracketed values are confirmed. Until then, render the brackets visibly so they cannot be missed.

**INSTATICKETS PRE-LAUNCH PRIVACY NOTICE**
Effective date: [DATE PUBLISHED]

This notice explains how InstaTickets handles the personal information you give us through this website before the InstaTickets platform launches on 15 November 2026. A full Privacy Policy will be published at launch.

**Who we are**
InstaTickets is operated by [REGISTERED COMPANY NAME], a Bullion Technologies company, 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe. We are responsible for the information described in this notice.

**What we collect**
Customer pre-registration: first name, last name, mobile number, email address (if you give it), the ticket categories you are interested in, and whether you want marketing messages.
Business registration: organisation name, contact person, mobile number, email address, business type, the tickets you want to offer, details of any existing ticketing system, and anything you tell us about your tickets.
Contact form: your name, email, phone number, enquiry type and message.
Website use: basic, anonymous usage statistics. See the Cookie Policy.

**Why we use it**
- To tell you when InstaTickets launches and invite you to activate your account.
- To send launch updates, offers and promotions, only if you ticked the marketing box.
- To contact businesses about partnership, onboarding, verification and integration.
- To answer enquiries sent through the contact form.
- To keep the website secure and understand how it is used.

**Who can see it**
Only authorised InstaTickets staff and the service providers that host our website, database and email, who act on our instructions. Some of these providers may store information outside Zimbabwe; where they do, we take steps to protect it as required by law.
We do not sell your information. We do not share customer details with ticket providers or other companies for their own marketing. Launch offers from participating providers are sent to you by InstaTickets.

**How long we keep it**
Customer pre-registration details: until you activate an InstaTickets account, or [12] months after launch if you do not, then deleted.
Business registration details: [24] months from your last contact with us, unless you become a partner, in which case your partner agreement applies.
Contact form enquiries: [12] months after the enquiry is closed.

**Your choices and rights**
You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing messages at any time. Every marketing message will also tell you how to opt out.
To make a request, email info@instatickets.co.zw with the subject "Data Request", or message us on WhatsApp at +263 772 270 533. We will respond within [30] days.
If you are unhappy with how we handle your information, you may complain to the Data Protection Authority (POTRAZ).

**Changes**
We may update this notice. The effective date above will show when it last changed.

---

## First prompt to paste into Claude Code

```text
Read docs/WEBSITE_BRIEF.md in full, and check that the five brand files listed in Section 5
are in public/brand/. Do not write any code yet. Post your plan: file structure, data model,
services and environment variables, and anything in the brief you think is wrong or unclear.
Then stop and wait for my approval before starting Phase 1.
```
