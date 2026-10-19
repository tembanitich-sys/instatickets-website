# Partner approval pack

Everything on the InstaTickets website that names a partner, shows a partner logo, or describes a partner channel. Send each partner its section with a preview link (a Vercel preview deployment of the `claude/admiring-allen-96aj86` branch shows all of it). When a partner approves in writing, record who and when below, then set its flag in `content/facts.ts` (`partnerApproved`). Until then the production site hides all of it.

The site launches on **Friday 13 November 2026**. USSD is shown as COMING SOON, with no date.

| Partner | Approved by | Date | Notes |
|---|---|---|---|
| EcoCash | | | |
| Econet (shops) | | | |
| TN CyberTech Bank (agents) | | | |

## Step-by-step guides (page /how-to-buy)

Each channel has a guide with a "where to start" control. The steps were **drafted by InstaTickets** from the customer Terms and the agreed architecture; each partner is asked to confirm or correct the steps for its channel before launch.

- **EcoCash app:** path taken from the customer wireframe: EcoCash app > Pay Biller > Online Billers > InstaTickets > Bus Tickets, then search, results, seats, passenger details, review and PIN, ticket by SMS with booking reference and QR code. EcoCash to confirm the menu names (we had also heard "Bill Payments").
- **CR-001, bus company storefronts (all channels):** every booking starts with SELECT BUS COMPANY (type a name, matched from the start of any word, or view the alphabetical list with the last-used company first) or BOOK TRIP BY ROUTE (trips from all companies by departure time, re-sortable by fare, no paid ranking). A storefront shows only that company's towns and trips, including when a trip is full. `/book?company=<slug>` opens a storefront directly. Demo companies are invented ("Sample ..."); sample fares run from $10 to $120, higher for cross-border trips. The storefront QR code is a placeholder.
- **Demo booking (/book, preview only):** follows the web wireframe: search, trips, seats, passenger details and next of kin, mobile number, review, accept Terms, EcoCash PIN (demo, nothing sent), ticket. No prices shown.
- **WhatsApp and USSD demos (/book, preview only):** click-through simulations. WhatsApp: Hi, menu, trip form, trips, passenger, summary, pay, ticket. USSD: *151#, Pay Bill, InstaTickets, Buy bus ticket, towns, date, trip, class, who is travelling, name, next of kin, PIN. Menu numbering and class names are illustrative: EcoCash to confirm.
- **USSD (COMING SOON):** from the USSD storyboard: dial *151#, Pay Bill, InstaTickets, Buy bus ticket, from, to, date, trip, class, who is travelling, next of kin, PIN. EcoCash to confirm.
- **WhatsApp:** save +263 772 270 533 as InstaTickets, open the chat, send "Hi", choose to book, answer the questions, tap Accept and pay. InstaTickets to confirm this is the booking number and that "Hi" starts the session.
- **InstaTickets app and website:** download or open, search, choose a trip and seat, accept the Terms, pay, ticket by SMS. Driven by the back office; to be confirmed against the real flow.
- **Econet Shops and TN CyberTech Bank agents:** find an agent, tell the agent the trip, the agent explains the bus company's refund policy before taking payment, pay and keep the receipt, ticket by SMS. Econet and TN CyberTech Bank to confirm; TN to say whether it has other channels (for example mobile banking) that should have their own guide.

## EcoCash

Logo: the EcoCash wordmark supplied by InstaTickets (`public/brand/partners/ecocash.png`), shown on a white label in the "Pay with the wallet you already use" block (headed "Payment partner"), and in the footer "Our partners" row. Please confirm it is the current logo and may be used this way.

Icons
- The EcoCash SuperApp icon (supplied artwork, `public/brand/channels/ecocash-superapp.png`) appears as the "EcoCash app" channel icon in the hero, on the "Buy your way" card and in the For Businesses icon row. A "*151#" tile marks USSD, with a SOON badge in the hero. Please confirm the icon and that the code *151# may be shown.
- The InstaTickets app icon is a mock-up in the same style (`public/brand/channels/instatickets-app.png`); it is replaced by the real app icon.

Home page
- Hero icons: EcoCash app, InstaTickets app, website, WhatsApp, USSD (SOON) and agents.
- Channel card, "IN THE ECOCASH APP": Find InstaTickets inside the EcoCash app and pay from your wallet.
- Channel card, "BY USSD" (COMING SOON): Dial *151# on any phone. No smartphone or data needed.
- Payment block: "Pay with the wallet you already use. InstaTickets works with EcoCash, so you can pay from your mobile wallet."

For Businesses page
- "They can also buy in the EcoCash app, and by USSD, which is coming soon."

Help page (FAQ)
- How can I buy a ticket? "Book on this website, in the InstaTickets app or on WhatsApp, in the EcoCash app, or pay a registered InstaTickets Agent in person."
- Do I need a smartphone? "No. Registered InstaTickets Agents can sell you a ticket in person, and USSD booking is coming soon."

Terms and Conditions (draft, under legal review; EcoCash is named as an example wallet and channel)
- 1.1 the EcoCash app or other wallet bill-payment menus as a channel.
- Acceptance table: "EcoCash app or other wallet bill-payment menu" row.
- Charges table: "Wallet transaction charges (e.g. EcoCash)", charged by the wallet provider, outside the InstaTickets total.
- 8.5 "Your wallet provider (for example EcoCash) and InstaTickets Agents cannot process refunds for an issued ticket."

## Econet (shops)

- Find an Agent: "Search by town or city to find an agent, an Econet Shop or a TN CyberTech Bank agent." and the outlet type "Econet Shop".
- Shown as "Econet Shops" in an "Available at" row (home page and Find an Agent) and in the footer "Our partners" row. The Econet logo has not been supplied: the name shows as text until `public/brand/partners/econet.png` is added.
- Each listed shop is named "Econet Shop, <location>". The seed list comes from public web pages and is unverified; please supply the confirmed list.

## TN CyberTech Bank (agents)

- Find an Agent: the same sentence as above, and the outlet type "TN CyberTech Bank agent".
- Logo: cropped from the TN CyberTech Bank artwork supplied by InstaTickets (`public/brand/partners/tn.png`), kept on its own black background, in the same "Available at" and "Our partners" rows. Please confirm it is the current logo.
- No outlet list has been supplied; the bank is asked for the list it is happy to publish.

## Placeholder content in this draft

This preview is a draft of the launch site. The outlet list, the Terms and Conditions text and the store links are placeholders, to be replaced with confirmed data before launch.

## Statements that come from the agreed architecture and the draft Terms

- The FAQ says: "If you pay and do not receive a ticket, InstaTickets returns your money automatically." This reflects the technical architecture agreed with EcoCash (also Terms section 7).
- The placeholder Terms state a service fee of US$0.30 per ticket and are written for bus tickets only; the final Terms may change both.
- The placeholder Terms contain unconfirmed values, shown highlighted: version, effective date, partner bank, reversal and response times, and a page of operator contacts that does not exist yet.
