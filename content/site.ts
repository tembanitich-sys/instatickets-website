/**
 * All page copy lives here (brief Appendix A and B). Edit wording in this file
 * only; components read from it and contain no marketing text of their own.
 */

export const PRIVACY_NOTICE_VERSION = "2026-11-live";

export const contact = {
  email: "info@instatickets.co.zw",
  registrationsEmail: "registrations@instatickets.co.zw",
  whatsapp: { display: "+263 772 270 533", href: "https://wa.me/263772270533" },
  mobiles: [
    { display: "+263 771 802 240", tel: "+263771802240" },
    { display: "+263 719 802 240", tel: "+263719802240" },
  ],
  telephones: [
    { display: "+263 242 762014", tel: "+263242762014" },
    { display: "+263 242 762016", tel: "+263242762016" },
    { display: "+263 242 762024", tel: "+263242762024" },
    { display: "+263 242 762026", tel: "+263242762026" },
  ],
  address: {
    line: "153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe",
    street: "153 Sam Nujoma Street Extension",
    locality: "Belgravia, Harare",
    country: "Zimbabwe",
  },
} as const;

export const nav = {
  links: [
    { label: "Tickets", href: "/#tickets" },
    { label: "How to buy", href: "/how-to-buy" },
    { label: "Find an Agent", href: "/find-an-agent" },
    { label: "For Businesses", href: "/for-businesses" },
    { label: "Become an Agent", href: "/agents" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" },
  ],
  // The visible button shows `stub` plus the InstaTickets logo; `label` is its accessible name.
  // The address comes from content/facts.ts (the booking address supplied by the back office).
  book: { label: "BOOK A TICKET", stub: "BOOK" },
  findAgent: { label: "FIND AN AGENT", href: "/find-an-agent" },
  registerBusiness: { label: "REGISTER YOUR BUSINESS", href: "/for-businesses#register" },
  whatsappButton: "CHAT ON WHATSAPP",
} as const;

export const footer = {
  tagline: "One Platform. Every Ticket.",
  launching: "Buy online. Buy in person.",
  whatsappLink: "Chat on WhatsApp",
  groups: [
    {
      heading: "PLATFORM",
      links: [
        { label: "Home", href: "/" },
        { label: "Bus Tickets", href: "/#bus" },
        { label: "Event Tickets", href: "/#events" },
        { label: "Sports Tickets", href: "/#sports" },
        { label: "How to Buy", href: "/how-to-buy" },
        { label: "Find an Agent", href: "/find-an-agent" },
      ],
    },
    {
      heading: "BUSINESS",
      links: [
        { label: "For Businesses", href: "/for-businesses" },
        { label: "Become an Agent", href: "/agents" },
        { label: "Build with InstaTickets", href: "/for-businesses#build" },
      ],
    },
    {
      heading: "SUPPORT",
      links: [
        { label: "Help / FAQ", href: "/help" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Notice", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ],
  bullionLine: "A BULLION TECHNOLOGIES PRODUCT",
  bullionText: "InstaTickets is built and operated by Bullion Technologies.",
  copyright: "© 2026 InstaTickets. All rights reserved.",
} as const;

export const home = {
  hero: {
    headline: "ONE PLATFORM. EVERY TICKET.",
    subheading: "Discover, connect and access tickets through InstaTickets.",
    categories: ["BUS", "EVENTS", "SPORTS"],
    launchLine: "BUY ONLINE. BUY IN PERSON.",
    channelsHeading: "BUY ANYWHERE",
    secondary: "FIND AN AGENT",
    soon: "COMING SOON",
    soonShort: "SOON",
    // Icons under the hero logo; `label` is the accessible name and tooltip. `partner` icons only
    // show once that partner has approved the site. The website icon links to the tickets section.
    chips: [
      { key: "ecocashApp", label: "EcoCash app", href: "/how-to-buy#ecocashApp", partner: "ecocash" },
      { key: "app", label: "InstaTickets app", href: "/how-to-buy#app" },
      { key: "web", label: "Website", href: "/#tickets" },
      { key: "whatsapp", label: "WhatsApp", href: "/how-to-buy#whatsapp" },
      { key: "ussd", label: "USSD *151#", href: "/how-to-buy#ussd", partner: "ecocash" },
      { key: "agents", label: "Find an agent", href: "/find-an-agent" },
    ],
  },
  find: {
    heading: "What can you find on InstaTickets?",
    cards: [
      {
        key: "bus",
        title: "BUS",
        body: "Find and book available bus journeys from participating operators.",
      },
      {
        key: "events",
        title: "EVENTS",
        body: "Concerts, festivals, fun runs, conferences, shows and more. Organisers: list your event on InstaTickets.",
      },
      {
        key: "sports",
        title: "SPORTS",
        body: "Football, rugby, cricket, athletics, motorsport and more. Sports organisations: list your fixtures on InstaTickets.",
      },
    ],
  },
  bus: {
    heading: "Bus tickets",
    body: "Find participating bus services and access ticket inventory through InstaTickets.",
    button: "EXPLORE BUS TICKETS",
    operators: "Operators: bring your routes to InstaTickets.",
    operatorsLink: "REGISTER YOUR BUSINESS",
  },
  events: {
    heading: "Events",
    body: "Concerts, festivals, fun runs, conferences, shows, community events and other ticketed experiences can connect with InstaTickets.",
    organisers:
      "Organisers: list your event on InstaTickets and reach customers across our distribution channels.",
    button: "REGISTER YOUR EVENT",
    types: ["Concerts", "Festivals", "Fun runs", "Conferences", "Shows", "Community events"],
  },
  sports: {
    heading: "Sports",
    body: "InstaTickets is designed to support ticketing across many sports, including football, rugby, cricket, athletics, motorsport, basketball, tennis and combat sports.",
    organisations: "Sports organisations: list your fixtures and events on InstaTickets.",
    button: "REGISTER YOUR SPORTING EVENT",
    types: [
      "Football",
      "Rugby",
      "Cricket",
      "Athletics",
      "Motorsport",
      "Basketball",
      "Tennis",
      "Combat sports",
    ],
  },
  how: {
    heading: "How InstaTickets works",
    customersHeading: "For customers",
    customers: [
      { title: "DISCOVER", body: "Find tickets from participating providers." },
      { title: "SELECT", body: "Choose your journey, event or fixture." },
      { title: "BOOK", body: "Complete your purchase through supported channels." },
      { title: "ACCESS", body: "Receive and manage your ticket." },
    ],
    businessesHeading: "For businesses",
    businesses: ["REGISTER", "VERIFY", "CONNECT", "PUBLISH"],
    businessesNote:
      "Participating businesses register, complete verification, connect their ticket inventory and publish through InstaTickets, subject to approval and technical requirements.",
  },
  channels: {
    heading: "Buy your way",
    body: "Every way of buying is part of one platform, so you can book wherever is easiest for you.",
    // `partner` cards show only once that partner has approved the site (content/facts.ts).
    cards: [
      {
        key: "ecocashApp",
        title: "IN THE ECOCASH APP",
        body: "Find InstaTickets inside the EcoCash app and pay from your wallet.",
        partner: "ecocash",
      },
      {
        key: "app",
        title: "THE INSTATICKETS APP",
        body: "Download the app for iPhone and Android and keep your tickets with you.",
      },
      { key: "web", title: "ON THE WEBSITE", body: "Search and book right here, on any phone or computer." },
      { key: "whatsapp", title: "ON WHATSAPP", body: "Chat to book and receive your ticket on WhatsApp." },
      {
        key: "ussd",
        title: "BY USSD",
        body: "Dial *151# on any phone. No smartphone or data needed.",
        partner: "ecocash",
      },
      {
        key: "agents",
        title: "WITH AN AGENT",
        body: "Pay a registered InstaTickets Agent and get your ticket by SMS.",
      },
    ],
    soon: "COMING SOON",
    ticketNote: "Your ticket is sent to you by SMS, and by WhatsApp, email or in the app where available.",
    payHeading: "Pay with the wallet you already use",
    payBody: "InstaTickets works with EcoCash, so you can pay from your mobile wallet.",
    payLabel: "Payment partner",
    storeHeading: "Get the InstaTickets app",
    appStore: "Download on the App Store",
    playStore: "Get it on Google Play",
  },
  inPerson: {
    heading: "InstaTickets in person",
    body: "Not everyone wants to book on a phone. Buy from a registered InstaTickets Agent, with or without a smartphone.",
    findHeading: "Find an InstaTickets Agent near you",
    findBody: "Search by town or city to find an agent, an Econet Shop or a TN CyberTech Bank agent.",
    findBodyGeneric: "Search by town or city to find a registered agent near you.",
    findButton: "FIND AN AGENT",
    subHeading: "Become an InstaTickets Agent",
    subBody:
      "Turn your shop, office or stall into a ticket point and earn commission on every ticket you sell for participating providers.",
    button: "BECOME AN AGENT",
  },
  different: {
    heading: "Why InstaTickets",
    cards: [
      {
        key: "one",
        title: "ONE PLACE",
        body: "Bus, events and sports from participating providers, together in one platform.",
      },
      {
        key: "every",
        title: "EVERY WAY TO BUY",
        body: "Online, in the apps, on WhatsApp and in person, so no customer is left out.",
      },
      {
        key: "phone",
        title: "ANY PHONE",
        body: "Registered agents sell to customers with or without a smartphone.",
      },
      {
        key: "providers",
        title: "BUILT FOR PROVIDERS",
        body: "Providers list once and reach customers through every channel.",
      },
    ],
  },
  launch: {
    heading: "Ready to travel?",
    body: "Search for a bus, event or fixture and book in minutes, or find an agent near you.",
    secondary: "REGISTER YOUR BUSINESS",
  },
  about: {
    heading: "About InstaTickets",
    body: [
      "InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with ticket inventory across multiple categories and participating ticketing systems. It brings ticket providers, ticketing platforms and customers together in one connected digital ecosystem.",
      "InstaTickets is a Bullion Technologies product.",
    ],
  },
} as const;

/** Validation and submission messages shown next to the form fields. */
export const formMessages = {
  firstName: "Enter your first name.",
  lastName: "Enter your last name.",
  name: "Enter your name.",
  phone: "Enter a valid mobile number for the selected country.",
  phoneOptional: "Enter a valid phone number for the selected country, or leave it blank.",
  email: "Enter a valid email address.",
  emailRequired: "Enter your email address.",
  organisationName: "Enter your organisation name.",
  applicantType: "Choose how you are applying.",
  province: "Choose your province.",
  town: "Enter your town or city.",
  sellingLocation: "Choose where you would sell.",
  hasDevice: "Tell us whether you have a smartphone or tablet.",
  contactPerson: "Enter a contact person.",
  businessType: "Choose a business type.",
  enquiryType: "Choose an enquiry type.",
  message: "Enter your message.",
  website: "Enter a valid website address, for example https://example.com.",
  privacy: "Please confirm that you have read the Privacy Notice.",
  tooLong: "This is too long.",
  invalidChoice: "Choose one of the options shown.",
  captcha: "Please complete the security check and try again.",
  rateLimited: "Too many attempts. Please wait a few minutes and try again.",
  serverError: "Something went wrong and your details were not saved. Please try again later.",
  fixErrors: "Please correct the highlighted fields.",
} as const;

export const contactSuccess = {
  heading: "THANK YOU. YOUR MESSAGE HAS BEEN SENT.",
  body: "An InstaTickets representative will get back to you.",
} as const;

export const forBusinesses = {
  hero: {
    headline: "PUT YOUR TICKETS ON INSTATICKETS",
    body: "InstaTickets connects ticket inventory with customers through a growing distribution ecosystem.",
    forLabel: "For:",
    audiences: [
      "Bus Operators",
      "Event Organisers",
      "Sports Organisations",
      "Venues",
      "Existing Ticketing Platforms",
      "Technology Partners",
    ],
  },
  existing: {
    heading: "Already have a ticketing system?",
    body: "Connect your ticketing system to InstaTickets. You do not necessarily need to replace it. If your system meets InstaTickets integration requirements, your ticket inventory may be connected to the platform, subject to integration requirements and approval.",
    partnerButton: "BECOME AN INSTATICKETS PARTNER",
    integrationButton: "INTEGRATION ENQUIRY",
  },
  channels: {
    heading: "Sell through every channel",
    body: "List your tickets once and customers can buy them in the InstaTickets app, on the website, on WhatsApp and in person from registered agents.",
    // Added only once EcoCash has approved the site (content/facts.ts).
    partnerBody: "They can also buy in the EcoCash app, and by USSD, which is coming soon.",
    button: "REGISTER YOUR BUSINESS",
  },
  form: {
    heading: "Have tickets to sell?",
    intro:
      "Register your business to explore becoming an InstaTickets partner. This is an expression of interest, not a full application.",
    fields: {
      organisationName: "Organisation Name",
      contactPerson: "Contact Person",
      mobile: "Mobile Number",
      email: "Email Address",
      businessType: "Business Type",
      offerings: "What would you like to offer through InstaTickets?",
      hasTicketingSystem: "Do you already have a ticketing system?",
      ticketingSystemName: "Ticketing system or provider name",
      website: "Website",
      details: "Tell us about your tickets",
      detailsHint: "Routes, event name and date, venue, expected capacity, ticket types.",
      optional: "(optional)",
    },
    businessTypes: [
      { value: "bus_operator", label: "Bus Operator" },
      { value: "event_organiser", label: "Event Organiser" },
      { value: "sports_organisation", label: "Sports Organisation" },
      { value: "venue", label: "Venue" },
      { value: "ticketing_platform", label: "Existing Ticketing Platform" },
      { value: "other", label: "Other" },
    ],
    offerings: [
      { value: "bus", label: "Bus Tickets" },
      { value: "events", label: "Event Tickets" },
      { value: "sports", label: "Sports Tickets" },
      { value: "other", label: "Other" },
    ],
    ticketingSystem: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "not_sure", label: "Not sure" },
    ],
    marketing: "I would like to receive InstaTickets updates by email.",
    privacyPrefix: "I have read the InstaTickets",
    privacyLink: "Privacy Notice",
    privacySuffix: ".",
    button: "REGISTER MY BUSINESS",
    successHeading: "THANK YOU. YOUR REGISTRATION HAS BEEN RECEIVED.",
    successBody:
      "An InstaTickets representative may contact you to discuss onboarding, verification, ticket inventory and integration requirements.",
  },
  build: {
    heading: "Build with InstaTickets",
    body: "Ticketing platforms and technology providers can explore integration with InstaTickets. Planned developer resources include API documentation, integration guides, a sandbox, authentication, inventory and booking integration, ticket issuance, webhooks, and testing and certification.",
    button: "REGISTER YOUR INTEREST",
  },
} as const;

export const agents = {
  hero: {
    headline: "EARN WITH INSTATICKETS",
    subheadline: "Join the InstaTickets Agent Network",
    body: "InstaTickets Agents sell bus, event and sports tickets on behalf of participating providers and earn commission on every ticket sold. Add a new income stream to your existing business, or start a new one.",
    button: "APPLY TO BECOME AN AGENT",
  },
  why: {
    heading: "Why become an agent",
    cards: [
      { key: "commission", title: "EARN COMMISSION", body: "Earn commission on every ticket you sell." },
      {
        key: "customers",
        title: "MORE CUSTOMERS",
        body: "Bring new customers through your door with a service people need.",
      },
      {
        key: "platform",
        title: "ONE PLATFORM",
        body: "Sell tickets from multiple participating providers in one place.",
      },
      {
        key: "support",
        title: "ONBOARDING SUPPORT",
        body: "Approved agents are set up and trained before they start selling.",
      },
    ],
  },
  who: {
    heading: "Who can apply",
    items: [
      "Individuals",
      "Shops and supermarkets",
      "Existing agents for other services",
      "Bus operator offices",
      "Other businesses with customer-facing premises",
    ],
  },
  how: {
    heading: "How it works",
    steps: [
      { title: "REGISTER", body: "Submit your details." },
      { title: "REVIEW", body: "We assess your application." },
      {
        title: "REQUIREMENTS AND TERMS",
        body: "We share the full requirements, commission terms and agent agreement with you.",
      },
      { title: "ONBOARDING", body: "Approved agents are set up and trained." },
    ],
  },
  note: "Commission rates and agent terms are shared with registered applicants. Earnings depend on the tickets you sell. Registration does not guarantee appointment as an InstaTickets Agent.",
  form: {
    heading: "Apply to become an agent",
    fields: {
      fullName: "Full Name",
      mobile: "Mobile Number",
      email: "Email Address",
      applicantType: "I am applying as",
      businessName: "Business or trading name",
      province: "Province",
      town: "Town or city",
      sellingLocation: "Where would you sell?",
      hasDevice: "Do you have a smartphone or tablet you could use for sales?",
      details: "Tell us about your business",
      choose: "Choose…",
    },
    applicantTypes: [
      { value: "individual", label: "Individual" },
      { value: "registered_business", label: "Registered business" },
      { value: "shop_or_supermarket", label: "Shop or supermarket" },
      { value: "existing_agent", label: "Existing agent for another service" },
      { value: "bus_operator_office", label: "Bus operator office" },
      { value: "other", label: "Other" },
    ],
    provinces: [
      "Bulawayo",
      "Harare",
      "Manicaland",
      "Mashonaland Central",
      "Mashonaland East",
      "Mashonaland West",
      "Masvingo",
      "Matabeleland North",
      "Matabeleland South",
      "Midlands",
    ],
    sellingLocations: [
      { value: "shop_or_premises", label: "Shop or premises" },
      { value: "market_stall", label: "Market stall" },
      { value: "office", label: "Office" },
      { value: "no_fixed_premises", label: "No fixed premises" },
      { value: "other", label: "Other" },
    ],
    hasDevice: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    marketing: "I would like to receive InstaTickets updates by SMS, WhatsApp or email.",
    privacyPrefix: "I have read the InstaTickets",
    privacyLink: "Privacy Notice",
    privacySuffix: ".",
    button: "APPLY TO BECOME AN AGENT",
    successHeading: "THANK YOU. YOUR APPLICATION HAS BEEN RECEIVED.",
    successBody:
      "An InstaTickets representative will contact you with the full requirements, commission terms and next steps.",
  },
} as const;

export const help = {
  heading: "Help",
  whatsappButton: "CHAT ON WHATSAPP",
  faq: [
    {
      q: "What is InstaTickets?",
      a: "A digital platform that brings bus, event and sports tickets from participating providers into one place.",
    },
    {
      q: "How can I buy a ticket?",
      a: "Book on this website, in the InstaTickets app or on WhatsApp, or pay a registered InstaTickets Agent in person.",
      // Used instead of `a` once EcoCash has approved the site (content/facts.ts).
      aPartner:
        "Book on this website, in the InstaTickets app or on WhatsApp, in the EcoCash app, or pay a registered InstaTickets Agent in person.",
    },
    {
      q: "Do I need a smartphone?",
      a: "No. Registered InstaTickets Agents can sell you a ticket in person.",
      aPartner:
        "No. Registered InstaTickets Agents can sell you a ticket in person, and USSD booking is coming soon.",
    },
    { q: "How do I pay?", a: "You can pay from your mobile wallet, or pay an InstaTickets Agent." },
    { q: "Where is my ticket sent?", a: "Your ticket is sent to you by SMS, and by WhatsApp, email or in the app where available." },
    {
      q: "What if I pay and do not get a ticket?",
      a: "If you pay and do not receive a ticket, InstaTickets returns your money automatically.",
    },
    {
      q: "I run a ticketing system. Do I have to replace it?",
      a: "Not necessarily. Systems that meet our integration requirements may be connected, subject to approval.",
    },
    { q: "Who is behind InstaTickets?", a: "InstaTickets is a Bullion Technologies product." },
    {
      q: "How do I become an InstaTickets Agent?",
      a: "Apply on the Become an Agent page. We'll review your application and share the full requirements, commission terms and next steps.",
    },
    {
      q: "How do I get help?",
      a: "Chat with us on WhatsApp or use the contact form.",
    },
  ],
  // The last answer renders these two phrases as links (WhatsApp, contact page).
  helpLinks: { whatsapp: "WhatsApp", contact: "contact form" },
} as const;

/** Small UI labels shared by the forms. */
export const ui = {
  optional: "(optional)",
  effectiveDate: "Effective date:",
  skipToContent: "Skip to content",
} as const;

export const contactPage = {
  headline: "GET IN TOUCH",
  labels: {
    email: "Email",
    mobile: "Mobile",
    telephone: "Telephone",
    headOffice: "Head Office",
  },
  form: {
    fields: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      enquiryType: "Enquiry Type",
      message: "Message",
    },
    enquiryTypes: [
      { value: "general", label: "General Enquiry" },
      { value: "business_partnership", label: "Business Partnership" },
      { value: "bus_operator", label: "Bus Operator" },
      { value: "event", label: "Event" },
      { value: "sports", label: "Sports" },
      { value: "ticketing_integration", label: "Ticketing System Integration" },
      { value: "technical", label: "Technical" },
      { value: "other", label: "Other" },
    ],
    privacyPrefix: "I have read the InstaTickets",
    privacyLink: "Privacy Notice",
    privacySuffix: ".",
    button: "SEND MESSAGE",
  },
  businessNote: "To register a business, please use the business registration form.",
} as const;

export const notFoundPage = {
  heading: "Page not found",
  body: "The page you are looking for does not exist or has moved.",
  link: "Back to the home page",
} as const;

export const comingSoonPages = {
  cookies: { heading: "Cookie Policy", label: "COMING SOON" },
} as const;

/**
 * Appendix B. Bracketed values are unconfirmed and are rendered visibly
 * (highlighted) until they are replaced here. Do not remove the brackets
 * until the value is confirmed.
 */
export const privacy = {
  title: "INSTATICKETS PRIVACY NOTICE",
  effectiveDate: "1 October 2026",
  intro:
    "This notice explains how InstaTickets handles the personal information you give us through this website.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "InstaTickets is a Bullion Technologies product, operated by Bullion Technologies (Pvt) Ltd, 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe. Bullion Technologies (Pvt) Ltd is responsible for the information described in this notice.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Business registration: organisation name, contact person, mobile number, email address, business type, the tickets you want to offer, details of any existing ticketing system, and anything you tell us about your tickets.",
        "Agent applications: your name, mobile number, email address (if you give it), applicant type, business name, location, where you would sell, whether you have a device for sales, and anything you tell us about your business.",
        "Contact form: your name, email, phone number, enquiry type and message.",
        "Website use: basic, anonymous usage statistics. See the Cookie Policy.",
      ],
    },
    {
      heading: "Why we use it",
      bullets: [
        "To send updates, offers and promotions, only if you ticked the marketing box.",
        "To contact businesses about partnership, onboarding, verification and integration.",
        "To assess and respond to InstaTickets Agent applications.",
        "To answer enquiries sent through the contact form.",
        "To keep the website secure and understand how it is used.",
      ],
    },
    {
      heading: "Who can see it",
      paragraphs: [
        "Only authorised InstaTickets staff and the service providers that host our website, database and email, who act on our instructions. Some of these providers may store information outside Zimbabwe; where they do, we take steps to protect it as required by law.",
        "We do not sell your information. We do not share customer details with ticket providers or other companies for their own marketing.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Business registration details: 12 months from your last contact with us, unless you become a partner, in which case your partner agreement applies.",
        "Agent applications: 12 months from your last contact with us, unless you become an agent, in which case your agent agreement applies.",
        "Contact form enquiries: 12 months after the enquiry is closed.",
      ],
    },
    {
      heading: "Your choices and rights",
      paragraphs: [
        "You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing messages at any time. Every marketing message will also tell you how to opt out.",
        'To make a request, email info@instatickets.co.zw with the subject "Data Request", or message us on WhatsApp at +263 772 270 533. We will respond within 30 days.',
        "If you are unhappy with how we handle your information, you may complain to the Data Protection Authority (POTRAZ).",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update this notice. The effective date above will show when it last changed.",
      ],
    },
  ],
} as const;

export const findAgent = {
  headline: "FIND AN INSTATICKETS AGENT NEAR YOU",
  intro: "Buy your ticket in person from a registered InstaTickets Agent, with or without a smartphone.",
  introNamed: "Buy your ticket in person from a registered InstaTickets Agent, at an Econet Shop or a TN CyberTech Bank agent.",
  search: "Town, city or outlet",
  searchHint: "For example Harare or Mutare",
  province: "Province",
  type: "Type of outlet",
  all: "All",
  allTypes: "All outlets",
  kinds: { econet_shop: "Econet Shop", tn_agent: "TN CyberTech Bank agent" },
  results: (n: number) => (n === 1 ? "1 outlet found" : `${n} outlets found`),
  directions: "Get directions",
  empty: "No outlets match your search. Try a nearby town, or chat with us on WhatsApp and we will help you find one.",
  noneYet: "The list of agent locations is being updated. Chat with us on WhatsApp and we will point you to an agent near you.",
  checkFirst: "Opening hours and availability can change. Please check with the outlet before you travel.",
  becomeAgent: "Want to sell InstaTickets tickets yourself?",
  becomeAgentLink: "BECOME AN AGENT",
  reviewNote: "PREVIEW: outlet details here are placeholder content and will be replaced with confirmed data before launch.",
} as const;

/** Demo booking page (/book). It simulates the online booking journey with sample trips and is shown only in review builds. */
export const bookDemo = {
  headline: "BOOK YOUR TICKET",
  intro: "Search for a trip, choose a time and pay your way.",
  banner: "DEMO: this page simulates online booking with sample trips. Live booking is provided by the InstaTickets platform.",
  tabs: [
    { key: "bus", label: "Bus", enabled: true },
    { key: "events", label: "Events", enabled: false },
    { key: "sports", label: "Sports", enabled: false },
  ],
  tabSoon: "Soon",
  from: "From",
  to: "To",
  date: "Travel date",
  passengers: "Passengers",
  choose: "Choose a town",
  search: "SEARCH TRIPS",
  towns: ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Victoria Falls", "Kariba", "Chitungwiza"],
  sameTown: "Choose two different towns.",
  resultsHeading: (from: string, to: string) => `${from} to ${to}`,
  operator: "Sample operator",
  fare: "Fare shown at checkout",
  select: "SELECT",
  back: "Change search",
  stepLabels: ["Search", "Trip", "Seats", "Passengers", "Pay", "Ticket"],
  seatsHeading: "Choose your seats",
  seatsHint: (n: number) => `Choose ${n} ${n === 1 ? "seat" : "seats"}.`,
  seatFree: "Free",
  seatTaken: "Taken",
  seatChosen: "Yours",
  seatLabel: (n: number) => `Seat ${n}`,
  seatCount: 24,
  seatTakenList: [3, 4, 9, 14, 15, 21],
  seatsNeeded: "Choose all your seats to continue.",
  passengersHeading: "Passenger details",
  passengersHint: "Enter each passenger's details exactly as on their ID or travel document.",
  passengerTitle: (n: number) => `Passenger ${n}`,
  fullName: "Full name",
  idNumber: "ID or passport number",
  nextOfKin: "Next of kin (name and phone)",
  nextOfKinHint: "Someone we can contact in an emergency.",
  needAll: "Fill in every passenger's name and ID number to continue.",
  signIn: "Your contact number",
  signInHint: "We send your ticket to this number. In the live service you sign in with a one-time code, or continue as a guest.",
  mobile: "Mobile number",
  continueGuest: "CONTINUE AS GUEST",
  needMobile: "Enter your mobile number to continue.",
  reviewHeading: "Review and pay",
  summaryTrip: "Trip",
  summarySeats: "Seats",
  summaryPassengers: "Passengers",
  summaryFare: "Fare, service fee and total",
  summaryFareValue: "Shown here at checkout in the live service",
  refundNote: "The bus company's refund policy applies. Read it before you pay.",
  accept: "I accept the Terms and the bus company's refund policy.",
  needAccept: "Tick to accept the Terms and refund policy.",
  payWith: "Pay with",
  pin: "EcoCash PIN",
  pinHint: "Demo only: type any four digits. Nothing is sent or charged.",
  needPin: "Enter four digits to continue.",
  pay: "PAY",
  next: "CONTINUE",
  back2: "BACK",
  doneHeading: "Your ticket is booked",
  doneBody: "This is a demo ticket. In the live service your ticket, booking reference and QR code are sent to you by SMS, and by WhatsApp, email or in the app where available.",
  bookAgain: "BOOK ANOTHER TRIP",
  otherWays: "You can also buy in these ways:",
  refundPromise: "If you pay and do not receive a ticket, InstaTickets returns your money automatically.",
  reference: "Booking reference",
  referenceSample: "DEMO-0000",
  times: ["06:00", "09:30", "14:00"],
  operatorNames: ["A", "B", "C"],
} as const;

/**
 * "How to buy": a step-by-step guide per channel (page /how-to-buy). The steps are drafted from the
 * customer Terms and the agreed architecture, and must be confirmed by each partner before launch
 * (see docs/APPROVAL_PACK.md). `partner` guides show only once that partner has approved the site.
 * `action` picks the "where to start" control: book, stores, whatsapp, dial or find.
 */
export const howToBuy = {
  headline: "HOW TO BUY, STEP BY STEP",
  intro: "Pick the way that suits you. Every guide shows where to start and what to do next.",
  jump: "Jump to",
  startHere: "START HERE",
  soon: "COMING SOON",
  steps: "Steps",
  whatsappSave: "Save this number as InstaTickets:",
  whatsappStart: "OPEN WHATSAPP",
  whatsappText: "Hi",
  dialLabel: "DIAL *151#",
  dialCode: "*151#",
  bookLabel: "START BOOKING",
  findLabel: "FIND AN AGENT",
  footer: "Your ticket is sent to you by SMS, and by WhatsApp, email or in the app where available. If you pay and do not receive a ticket, InstaTickets returns your money automatically.",
  help: "Stuck? Chat with us on WhatsApp and we will help you book.",
  seeSteps: "SEE THE STEPS",
  guides: [
    {
      id: "ecocashApp",
      channel: "ecocashApp",
      partner: "ecocash",
      title: "In the EcoCash app",
      path: ["EcoCash app", "Pay Biller", "Online Billers", "InstaTickets", "Bus Tickets"],
      action: "none",
      steps: [
        "Open the EcoCash app and sign in.",
        "Tap Pay Biller, then Online Billers.",
        "Choose InstaTickets, then Bus Tickets.",
        "Search: where you are travelling from and to, the date and the number of passengers.",
        "Choose a trip from the results, then pick your seats.",
        "Enter each passenger's details exactly as on their ID or travel document.",
        "Review the fare, the service fee, the total and the bus company's refund policy, then pay with your EcoCash PIN.",
        "Your tickets arrive by SMS, with your booking reference and a QR code. Show it when you board.",
      ],
    },
    {
      id: "app",
      channel: "app",
      title: "In the InstaTickets app",
      path: [],
      action: "stores",
      steps: [
        "Download the InstaTickets app from the App Store or Google Play.",
        "Open the app and sign in with your mobile number and the one-time code we send you, or continue as a guest.",
        "Search for your trip: where from and to, the date and the number of passengers.",
        "Choose a trip and your seat.",
        "Check the total, tick that you accept the Terms and the bus company's refund policy, and pay.",
        "Find your ticket in My Tickets. It is also sent to you by SMS.",
      ],
    },
    {
      id: "web",
      channel: "web",
      title: "On the website",
      path: [],
      action: "book",
      steps: [
        "Tap START BOOKING to open the booking page. Sign in with your mobile number and one-time code, or continue as a guest.",
        "Choose Bus and enter where you are travelling from and to, the date and the number of passengers.",
        "Choose a trip and your seat.",
        "Enter each passenger's details exactly as on their ID or travel document.",
        "Check the total, tick that you accept the Terms and the bus company's refund policy, and pay.",
        "Your ticket is sent to you by SMS, and by email where you gave one.",
      ],
    },
    {
      id: "whatsapp",
      channel: "whatsapp",
      title: "On WhatsApp",
      path: [],
      action: "whatsapp",
      steps: [
        "Save our WhatsApp number in your phone as InstaTickets.",
        "Open WhatsApp and start a chat with InstaTickets.",
        "Send Hi to begin.",
        "Pick Book a bus ticket from the list.",
        "Fill in the booking form: where from and to, the date and the number of passengers, then choose a trip and seats.",
        "Check the order summary and tap Accept and pay.",
        "Pay when asked. Your ticket arrives in the chat and by SMS.",
      ],
    },
    {
      id: "ussd",
      channel: "ussd",
      partner: "ecocash",
      title: "By USSD",
      path: ["Dial *151#", "Pay Bill", "InstaTickets", "Buy bus ticket"],
      action: "dial",
      steps: [
        "On any phone, dial *151# and press call. You do not need a smartphone or data.",
        "Choose Pay Bill, then InstaTickets.",
        "Choose Buy bus ticket.",
        "Enter where you are travelling from and to, then the date.",
        "Choose a trip and a class, and say who is travelling.",
        "Add a next of kin, check the total, then enter your PIN to pay.",
        "Your ticket is sent to you by SMS.",
      ],
    },
    {
      id: "agents-econet",
      channel: "agents",
      partner: "econet",
      title: "At an Econet Shop",
      path: [],
      action: "find",
      steps: [
        "Find your nearest Econet Shop with Find an Agent.",
        "Tell the agent where and when you want to travel and how many passengers.",
        "The agent shows you the trips and tells you the bus company's refund policy before taking payment.",
        "Pay the agent and keep your receipt.",
        "Your ticket is sent to your phone by SMS. Keep it until your journey ends.",
      ],
    },
    {
      id: "agents-tn",
      channel: "agents",
      partner: "tn",
      title: "At a TN CyberTech Bank agent",
      path: [],
      action: "find",
      steps: [
        "Find your nearest TN CyberTech Bank agent with Find an Agent.",
        "Tell the agent where and when you want to travel and how many passengers.",
        "The agent shows you the trips and tells you the bus company's refund policy before taking payment.",
        "Pay the agent and keep your receipt.",
        "Your ticket is sent to your phone by SMS. Keep it until your journey ends.",
      ],
    },
  ],
} as const;
