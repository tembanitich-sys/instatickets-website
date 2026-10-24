/**
 * Partner onboarding portal (operators.instatickets.co.zw/partner): wording, the currency
 * list, and the document checklists taken from the Operator Agreement (Schedule 2), the
 * EcoCash Term Sheet (Annex A) and the Event and Sports Organiser Agreement (Schedule 2).
 * Edit wording here; components and emails read from this file.
 */

export type PartnerType = "bus_operator" | "event_organiser";
export type Currency = "USD" | "ZWG" | "ZAR" | "BWP";

/** Every currency is active from launch. Codes follow ISO 4217 (ZiG is ZWG). */
export const CURRENCIES: { code: Currency; label: string; short: string }[] = [
  { code: "USD", label: "US Dollar (USD)", short: "USD" },
  { code: "ZWG", label: "Zimbabwe Gold (ZiG)", short: "ZiG" },
  { code: "ZAR", label: "South African Rand (ZAR)", short: "ZAR" },
  { code: "BWP", label: "Botswana Pula (BWP)", short: "BWP" },
];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [Currency, ...Currency[]];
export const currencyShort = (code: string) => CURRENCIES.find((c) => c.code === code)?.short ?? code;

export const partnerTypes: Record<PartnerType, { label: string; prefix: string; contactLabel: string }> = {
  bus_operator: { label: "Bus operator", prefix: "OP", contactLabel: "Finance contact" },
  event_organiser: { label: "Event or sports organiser", prefix: "EO", contactLabel: "Main contact" },
};

export const partnerStatuses = {
  created: "Not yet invited",
  invited: "Invited",
  draft: "In progress",
  submitted: "Submitted",
  under_review: "Under review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
} as const;
export type PartnerStatus = keyof typeof partnerStatuses;

export const integrationStatuses = {
  not_started: "Not started",
  standard_sent: "Integration Standard sent",
  certified: "Certified",
  live: "Live",
} as const;
export type IntegrationStatus = keyof typeof integrationStatuses;

export const eventStatuses = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  changes_requested: "Changes requested",
  order_form_sent: "Event Order Form sent",
  approved: "Approved for sale",
  rejected: "Rejected",
} as const;
export type EventStatus = keyof typeof eventStatuses;

export const organiserTypes = [
  { value: "organiser", label: "Event organiser" },
  { value: "promoter", label: "Promoter" },
  { value: "venue", label: "Venue" },
  { value: "sports_body", label: "Sports body, league or club" },
] as const;

export const eventTypes = [
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "conference", label: "Conference" },
  { value: "exhibition", label: "Exhibition" },
  { value: "sports_fixture", label: "Sports fixture" },
  { value: "season", label: "Season" },
] as const;

/**
 * Document slots. `multiple` allows several files. `perCurrency` repeats the slot for every
 * settlement currency (bank_letter:USD, bank_letter:ZAR ...). `who` says who uploads it.
 */
export type SlotDef = {
  slot: string;
  label: string;
  hint?: string;
  who: "partner" | "bullion" | "library";
  multiple?: boolean;
  perCurrency?: boolean;
};

export const busSlots: SlotDef[] = [
  { slot: "incorporation", label: "Certificate of incorporation", who: "partner" },
  { slot: "cr6_cr14", label: "CR6 and CR14", who: "partner", multiple: true },
  { slot: "operator_licence", label: "Operator licence", who: "partner" },
  { slot: "route_permits", label: "Route permits for every route listed", who: "partner", multiple: true },
  { slot: "tax_clearance", label: "Current ZIMRA tax clearance (ITF263)", who: "partner" },
  { slot: "timetables", label: "Published timetables", who: "partner", multiple: true },
  { slot: "sample_manifest", label: "Sample passenger manifest", who: "partner" },
  { slot: "fitness_certificates", label: "Certificates of fitness for the fleet", who: "partner", multiple: true },
  { slot: "passenger_insurance", label: "Passenger insurance schedule", who: "partner" },
  {
    slot: "refund_policy",
    label: "Refund and cancellation policy",
    hint: "Not needed if you gave a link to the policy in the form.",
    who: "partner",
  },
  { slot: "bank_letter", label: "Bank confirmation letter", who: "partner", perCurrency: true },
  { slot: "ids", label: "IDs of directors and authorised signatories", who: "partner", multiple: true },
];

export const organiserSlots: SlotDef[] = [
  { slot: "incorporation", label: "Certificate of incorporation or business registration", who: "partner" },
  { slot: "ids", label: "IDs of principals and authorised signatories", who: "partner", multiple: true },
  { slot: "tax_clearance", label: "Current ZIMRA tax clearance (ITF263)", who: "partner" },
  { slot: "bank_letter", label: "Bank confirmation letter", who: "partner", perCurrency: true },
  {
    slot: "track_record",
    label: "References or past event records (or the deposit or guarantee document)",
    who: "partner",
    multiple: true,
  },
];

export const eventSlots: SlotDef[] = [
  { slot: "venue_contract", label: "Venue contract or booking confirmation", who: "partner" },
  {
    slot: "permits",
    label: "Permits and clearances, including police clearance where applicable",
    who: "partner",
    multiple: true,
  },
  { slot: "capacity_certificate", label: "Venue capacity certificate", who: "partner" },
  { slot: "ticket_plan", label: "Ticket class plan (optional)", who: "partner" },
  { slot: "fixture_confirmation", label: "Fixture confirmation from the governing body", who: "partner" },
  { slot: "gate_plan", label: "Gate plan", who: "partner" },
  { slot: "liability_insurance", label: "Public liability insurance schedule", who: "partner" },
  { slot: "refund_policy", label: "Cancellation, postponement and refund policy", who: "partner" },
];

/** Contract documents. Bullion uploads the originals; the partner uploads signed copies. */
export const contractSlots = {
  busMasterTerms: { slot: "master_terms_bus", label: "Operator Agreement: Master Terms and Schedules 2 to 6" },
  organiserMasterTerms: { slot: "master_terms_events", label: "Event and Sports Organiser Agreement: Master Terms" },
  integrationStandard: { slot: "integration_standard", label: "InstaTickets Operator Integration Standard" },
  orderForm: { slot: "order_form", label: "Order Form (Schedule 1)" },
  addendum: { slot: "addendum", label: "Anchor Operator Addendum" },
  executed: { slot: "executed_agreement", label: "Executed agreement (countersigned)" },
  signedMaster: { slot: "signed_master_terms", label: "Signed Master Terms" },
  signedOrderForm: { slot: "signed_order_form", label: "Signed Order Form" },
  signedAddendum: { slot: "signed_addendum", label: "Signed Anchor Operator Addendum" },
  eventOrderForm: { slot: "event_order_form", label: "Event Order Form" },
  signedEventOrderForm: { slot: "signed_event_order_form", label: "Signed Event Order Form" },
  executedEventOrderForm: { slot: "executed_event_order_form", label: "Executed Event Order Form" },
} as const;

/** Library documents Bullion uploads once, in Admin > Partner documents. */
export const librarySlots = [
  contractSlots.busMasterTerms,
  contractSlots.organiserMasterTerms,
  contractSlots.integrationStandard,
] as const;

export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
export const UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const portal = {
  name: "InstaTickets Partner Portal",
  signIn: {
    heading: "Sign in to the Partner Portal",
    intro: "Enter the email address InstaTickets has on file for your company. We will email you a one-time sign-in link.",
    email: "Email address",
    button: "EMAIL ME A SIGN-IN LINK",
    sent: "If that email address is registered, a sign-in link is on its way. It works once and expires in 30 minutes.",
    notInvited:
      "Onboarding is by invitation. If your company is interested in selling on InstaTickets, register your interest instead.",
    interestLink: "Register your interest",
  },
  continue: {
    heading: "Continue to the Partner Portal",
    body: "Press the button to sign in. The link works once.",
    button: "CONTINUE",
    invalid: "This sign-in link has expired or has already been used. Request a new one below.",
  },
  dashboard: {
    signOut: "Sign out",
    statusLabel: "Status",
    integrationLabel: "Integration",
    reference: "Reference",
    changesRequested: "InstaTickets has asked for changes:",
    submittedNote: "Thank you. Your submission is with InstaTickets for review. You will be emailed when it changes.",
    approvedNote: "Your onboarding is approved and your agreement has been countersigned.",
    save: "SAVE PROGRESS",
    saved: "Saved.",
    submit: "SUBMIT FOR REVIEW",
    submitIntro:
      "When everything is complete, submit for review. You can no longer change the details after submitting, unless InstaTickets asks for changes.",
    missingHeading: "Before you can submit:",
    lockedNote: "These details are with InstaTickets and cannot be changed now.",
  },
  sections: {
    company: "Company",
    system: "Ticketing system",
    contacts: "Contacts",
    routes: "Routes and fare currencies",
    routesIntro:
      "One row per route you want to sell. Choose every currency you price that route in. A settlement account is needed for each currency you choose.",
    currencies: "Selling currencies",
    currenciesIntro: "Choose every currency you will sell tickets in. A settlement account is needed for each.",
    accounts: "Settlement accounts",
    accountsIntro: "One account per currency. Upload a bank confirmation letter for each account under Documents.",
    signatories: "Authorised signatories for settlement account changes",
    signatoriesIntro: "Two people who must both sign any instruction to change a settlement account.",
    customerService: "Customer service",
    trackRecord: "Track record",
    trackRecordIntro:
      "Up to three comparable events you have delivered. First-time organisers provide a security deposit or guarantee instead.",
    expiry: "Expiry dates",
    declarations: "Declarations",
    documents: "Documents",
    documentsIntro: "PDF, JPG or PNG, up to 20 MB each.",
    contract: "Your agreement",
    contractIntro:
      "Download each document, sign it (by hand and scan, or by e-signature) and upload the signed copy. InstaTickets countersigns within 24 hours of approval.",
    events: "Your events",
    eventsIntro: "Submit each event at least 14 days before tickets go on sale. Each event needs its own documents.",
  },
  declarations: {
    true: "The information and documents in this submission are true, complete and current.",
    honour: "We will honour every ticket sold through InstaTickets.",
    capacity: "We will never sell more tickets than the licensed capacity of the venue or any ticket class.",
  },
  sameAsFinance: "Same as finance contact",
  sameAsMain: "Same as main contact",
  addRoute: "ADD A ROUTE",
  addClass: "ADD A TICKET CLASS",
  addEvent: "ADD A PAST EVENT",
  remove: "Remove",
  upload: "Upload",
  uploading: "Uploading…",
  download: "Download",
  newEvent: "SUBMIT A NEW EVENT",
  eventsLocked: "You can submit events once your onboarding is approved.",
} as const;

/** Emails. Plain text, sent from accounts@instatickets.co.zw. */
export const partnerEmails = {
  signature: [
    "",
    "Kind regards,",
    "InstaTickets Partner Onboarding",
    "accounts@instatickets.co.zw",
    "",
    "InstaTickets, a Bullion Technologies product",
    "Bullion Technologies (Pvt) Ltd, 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe",
  ],
  invitation: {
    subject: (ref: string) => `Your invitation to onboard with InstaTickets (${ref})`,
    lines: (p: { name: string; company: string; ref: string; link: string; bus: boolean }) => [
      `Dear ${p.name},`,
      "",
      `Thank you for the time you have given us. ${p.company} is invited to onboard with InstaTickets. Your reference is ${p.ref}.`,
      "",
      "Use this secure link to sign in to the InstaTickets Partner Portal. It works once and expires in 7 days; you can request a new link from the portal at any time.",
      p.link,
      "",
      "In the portal you will:",
      "- complete your company details, contacts and settlement accounts (one per currency);",
      "- upload your supporting documents;",
      p.bus
        ? "- download your Operator Agreement, sign it and upload the signed copy; and"
        : "- download your Organiser Agreement, sign it and upload the signed copy; and",
      p.bus
        ? "- name your technical contact, who will receive the Integration Standard as soon as you submit."
        : "- once approved, submit each event with its own documents.",
      "",
      "Your agreement contains rates agreed with your company only. Please keep it confidential.",
    ],
  },
  signIn: {
    subject: "Your InstaTickets Partner Portal sign-in link",
    lines: (p: { link: string }) => [
      "Use this link to sign in to the InstaTickets Partner Portal. It works once and expires in 30 minutes.",
      p.link,
      "",
      "If you did not ask for this, you can ignore this email.",
    ],
  },
  submitted: {
    subject: (ref: string) => `We have received your onboarding submission (${ref})`,
    lines: (p: { name: string; ref: string; bus: boolean }) => [
      `Dear ${p.name},`,
      "",
      `Thank you. We have received your onboarding submission, reference ${p.ref}. Our team will review it and countersign your agreement within 24 hours of approval.`,
      ...(p.bus
        ? ["", "Your technical contact has been sent the InstaTickets Integration Standard, so integration can start now."]
        : []),
    ],
  },
  team: {
    subject: (ref: string, what: string) => `${what} ${ref}`,
  },
  integration: {
    subject: (ref: string) => `InstaTickets integration pack: Integration Standard and sandbox access (${ref})`,
    lines: (p: { name: string; company: string; ref: string; attached: boolean; credentials: string }) => [
      `Dear ${p.name},`,
      "",
      `${p.company} has named you as its technical contact for InstaTickets (reference ${p.ref}).`,
      "",
      p.attached
        ? "Attached is the InstaTickets Operator Integration Standard. It sets out the capabilities your ticketing system must provide and the certification tests it must pass."
        : "Our technical team will send you the InstaTickets Operator Integration Standard shortly.",
      "",
      "Your sandbox access:",
      p.credentials,
      "",
      "Please keep these credentials confidential. The target is to complete integration and pass certification within 7 days. Production credentials are issued after certification.",
      "",
      "Please reply to this email with any technical questions.",
    ],
  },
  changes: {
    subject: (ref: string) => `Changes requested on your InstaTickets onboarding (${ref})`,
    lines: (p: { name: string; note: string; link: string }) => [
      `Dear ${p.name},`,
      "",
      "Thank you for your submission. Before we can approve it, please attend to the following:",
      "",
      p.note,
      "",
      "Sign in to the Partner Portal to make the changes and submit again:",
      p.link,
    ],
  },
  approved: {
    subject: (ref: string) => `Your InstaTickets onboarding is approved (${ref})`,
    lines: (p: { name: string; link: string; bus: boolean }) => [
      `Dear ${p.name},`,
      "",
      "Your onboarding is approved and your agreement has been countersigned. The executed agreement is in the Partner Portal:",
      p.link,
      "",
      p.bus
        ? "Distribution switches on once your integration has passed certification."
        : "You can now submit your events through the portal.",
    ],
  },
  rejected: {
    subject: (ref: string) => `Your InstaTickets onboarding (${ref})`,
    lines: (p: { name: string; note: string }) => [
      `Dear ${p.name},`,
      "",
      "Thank you for your interest in InstaTickets. We are unable to admit your company at this time, for the following reason:",
      "",
      p.note,
      "",
      "You are welcome to reapply at the next intake.",
    ],
  },
  eventOrderForm: {
    subject: (ref: string) => `Your Event Order Form is ready to sign (${ref})`,
    lines: (p: { name: string; event: string; link: string }) => [
      `Dear ${p.name},`,
      "",
      `The Event Order Form for ${p.event} is ready. Sign in, download it, sign it and upload the signed copy:`,
      p.link,
    ],
  },
  eventChanges: {
    subject: (ref: string) => `Changes requested on your event (${ref})`,
    lines: (p: { name: string; event: string; note: string; link: string }) => [
      `Dear ${p.name},`,
      "",
      `Before we can approve ${p.event}, please attend to the following:`,
      "",
      p.note,
      "",
      p.link,
    ],
  },
  eventApproved: {
    subject: (ref: string) => `Your event is approved for sale (${ref})`,
    lines: (p: { name: string; event: string; link: string }) => [
      `Dear ${p.name},`,
      "",
      `${p.event} is approved for sale on InstaTickets. The executed Event Order Form is in the portal:`,
      p.link,
    ],
  },
  eventSubmitted: {
    subject: (ref: string) => `We have received your event (${ref})`,
    lines: (p: { name: string; event: string; ref: string }) => [
      `Dear ${p.name},`,
      "",
      `Thank you. We have received ${p.event}, reference ${p.ref}. We will review it and send you the Event Order Form.`,
    ],
  },
  reminder: {
    subject: (ref: string) => `Reminder: complete your InstaTickets onboarding (${ref})`,
    lines: (p: { name: string; link: string }) => [
      `Dear ${p.name},`,
      "",
      "This is a reminder to complete your onboarding in the InstaTickets Partner Portal. Use this link to sign in:",
      p.link,
    ],
  },
} as const;
