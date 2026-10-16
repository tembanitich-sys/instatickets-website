# Partner approval pack

Everything on the InstaTickets website that names a partner, shows a partner logo, or describes a partner channel. Send each partner its section with a preview link (a Vercel preview deployment of the `claude/admiring-allen-96aj86` branch shows all of it). When a partner approves in writing, record who and when below, then set its flag in `content/facts.ts` (`partnerApproved`). Until then the production site hides all of it.

The site launches on **Friday 13 November 2026**. USSD is shown as COMING SOON, with no date.

| Partner | Approved by | Date | Notes |
|---|---|---|---|
| EcoCash | | | |
| Econet (shops) | | | |
| TN CyberTech Bank (agents) | | | |

## EcoCash

Logo: the EcoCash wordmark supplied by InstaTickets (`public/brand/partners/ecocash.png`), shown on a light background in the "Pay with the wallet you already use" block, headed "Payment partner". Please confirm it is the current logo and may be used this way.

Home page
- Hero chips: "EcoCash app" and "USSD COMING SOON".
- Channel card, "IN THE ECOCASH APP": Find InstaTickets inside the EcoCash app and pay from your wallet.
- Channel card, "BY USSD" (COMING SOON): Dial a code on any phone. No smartphone or data needed.
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
- Each listed shop is named "Econet Shop, <location>". The seed list comes from public web pages and is unverified; please supply the confirmed list.

## TN CyberTech Bank (agents)

- Find an Agent: the same sentence as above, and the outlet type "TN CyberTech Bank agent".
- No outlet list has been supplied; the bank is asked for the list it is happy to publish.

## Statements to confirm with legal (from the draft Terms and the FAQ)

- The FAQ says: "If you pay and do not receive a ticket, InstaTickets returns your money automatically." (Terms section 7).
- The Terms state a service fee of US$0.30 per ticket, and are written for bus tickets only while the site also sells events and sports.
- The Terms contain unconfirmed values, shown highlighted: version, effective date, partner bank, reversal and response times, and a page of operator contacts that does not exist yet.
