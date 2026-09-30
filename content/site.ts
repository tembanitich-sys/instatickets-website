/**
 * All page copy lives here (brief Appendix A and B). Edit wording in this file
 * only; components read from it and contain no marketing text of their own.
 */

export const LAUNCH_LABEL = "15 November 2026";

export const PRIVACY_NOTICE_VERSION = "2026-10-pre-launch";

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
    { label: "Home", href: "/" },
    { label: "Bus", href: "/#bus" },
    { label: "Events", href: "/#events" },
    { label: "Sports", href: "/#sports" },
    { label: "For Businesses", href: "/for-businesses" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" },
  ],
  join: { label: "JOIN INSTATICKETS", href: "/#join" },
  registerBusiness: { label: "REGISTER YOUR BUSINESS", href: "/for-businesses#register" },
  whatsappButton: "CHAT ON WHATSAPP",
} as const;

export const footer = {
  tagline: "ONE PLATFORM. EVERY TICKET.",
  categories: ["BUS", "EVENTS", "SPORTS"],
  bullionLine: "A BULLION TECHNOLOGIES COMPANY",
  links: [
    { label: "Home", href: "/" },
    { label: "Bus", href: "/#bus" },
    { label: "Events", href: "/#events" },
    { label: "Sports", href: "/#sports" },
    { label: "For Businesses", href: "/for-businesses" },
    { label: "Join InstaTickets", href: "/#join" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Pre-Launch Privacy Notice", href: "/privacy", comingSoon: false },
    { label: "Terms & Conditions", href: "/terms", comingSoon: true },
    { label: "Cookie Policy", href: "/cookies", comingSoon: true },
  ],
  copyright: "© 2026 InstaTickets. All rights reserved.",
  comingSoon: "COMING SOON",
} as const;

export const home = {
  hero: {
    headline: "ONE PLATFORM. EVERY TICKET.",
    subheading: "Discover, connect and access tickets through InstaTickets.",
    categories: ["BUS", "EVENTS", "SPORTS"],
    launchLine: "LAUNCHING 15 NOVEMBER 2026",
    primary: "JOIN INSTATICKETS",
    secondary: "REGISTER YOUR BUSINESS",
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
  preregister: {
    heading: "Get ready for InstaTickets",
    body: "Pre-register before launch to be among the first to hear when InstaTickets goes live. Registered users may qualify for launch promotions, discounts and special offers from participating ticket providers.",
  },
  offers: {
    heading: "Launch offers & promotions",
    body: "Participating providers may offer launch promotions and discounts to registered InstaTickets users.",
    button: "JOIN INSTATICKETS",
  },
  launch: {
    heading: "Be part of the InstaTickets launch",
    body: "InstaTickets launches on 15 November 2026. Customers can pre-register now. Businesses can register their interest and start the partner conversation.",
    primary: "JOIN INSTATICKETS",
    secondary: "REGISTER YOUR BUSINESS",
  },
  about: {
    heading: "About InstaTickets",
    body: [
      "InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with ticket inventory across multiple categories and participating ticketing systems. It brings ticket providers, ticketing platforms and customers together in one connected digital ecosystem.",
      "InstaTickets is a Bullion Technologies company.",
    ],
  },
} as const;

export const countdown = {
  labels: { days: "DAYS", hours: "HOURS", minutes: "MINUTES", seconds: "SECONDS" },
  liveHeading: "INSTATICKETS IS NOW LIVE",
  liveButton: "GET STARTED",
  // Accessible name for the timer; not shown on screen.
  timerLabel: "Time until InstaTickets launches",
} as const;

export const customerForm = {
  fields: {
    firstName: "First Name",
    lastName: "Last Name",
    mobile: "Mobile Number",
    email: "Email Address",
    interestedIn: "Interested in",
  },
  interests: [
    { value: "bus", label: "Bus" },
    { value: "events", label: "Events" },
    { value: "sports", label: "Sports" },
  ],
  marketing:
    "I would like to receive InstaTickets launch updates, offers and promotions by SMS, WhatsApp or email.",
  privacyPrefix: "I have read the InstaTickets",
  privacyLink: "Pre-Launch Privacy Notice",
  privacySuffix: ".",
  button: "PRE-REGISTER",
  successHeading: "YOU'RE ON THE LIST.",
  successBody:
    "Thank you for pre-registering. When InstaTickets launches, we'll invite you to verify your number and activate your account.",
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
    privacyLink: "Pre-Launch Privacy Notice",
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

export const help = {
  heading: "Help",
  whatsappButton: "CHAT ON WHATSAPP",
  faq: [
    {
      q: "What is InstaTickets?",
      a: "A digital platform that brings bus, event and sports tickets from participating providers into one place.",
    },
    { q: "When does it launch?", a: "15 November 2026." },
    { q: "Is pre-registration free?", a: "Yes." },
    {
      q: "Does pre-registering create my account?",
      a: "Not yet. It reserves your place for launch updates. At launch we'll invite you to verify your number and activate your account.",
    },
    {
      q: "I run a ticketing system. Do I have to replace it?",
      a: "Not necessarily. Systems that meet our integration requirements may be connected, subject to approval.",
    },
    { q: "Who is behind InstaTickets?", a: "InstaTickets is a Bullion Technologies company." },
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
    privacyLink: "Pre-Launch Privacy Notice",
    privacySuffix: ".",
    button: "SEND MESSAGE",
  },
  businessNote: "To register a business, please use the business registration form.",
} as const;

export const comingSoonPages = {
  terms: { heading: "Terms & Conditions", label: "COMING SOON" },
  cookies: { heading: "Cookie Policy", label: "COMING SOON" },
} as const;

/**
 * Appendix B. Bracketed values are unconfirmed and are rendered visibly
 * (highlighted) until they are replaced here. Do not remove the brackets
 * until the value is confirmed.
 */
export const privacy = {
  title: "INSTATICKETS PRE-LAUNCH PRIVACY NOTICE",
  effectiveDate: "[DATE PUBLISHED]",
  intro:
    "This notice explains how InstaTickets handles the personal information you give us through this website before the InstaTickets platform launches on 15 November 2026. A full Privacy Policy will be published at launch.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "InstaTickets is operated by [REGISTERED COMPANY NAME], a Bullion Technologies company, 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe. We are responsible for the information described in this notice.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Customer pre-registration: first name, last name, mobile number, email address (if you give it), the ticket categories you are interested in, and whether you want marketing messages.",
        "Business registration: organisation name, contact person, mobile number, email address, business type, the tickets you want to offer, details of any existing ticketing system, and anything you tell us about your tickets.",
        "Contact form: your name, email, phone number, enquiry type and message.",
        "Website use: basic, anonymous usage statistics. See the Cookie Policy.",
      ],
    },
    {
      heading: "Why we use it",
      bullets: [
        "To tell you when InstaTickets launches and invite you to activate your account.",
        "To send launch updates, offers and promotions, only if you ticked the marketing box.",
        "To contact businesses about partnership, onboarding, verification and integration.",
        "To answer enquiries sent through the contact form.",
        "To keep the website secure and understand how it is used.",
      ],
    },
    {
      heading: "Who can see it",
      paragraphs: [
        "Only authorised InstaTickets staff and the service providers that host our website, database and email, who act on our instructions. Some of these providers may store information outside Zimbabwe; where they do, we take steps to protect it as required by law.",
        "We do not sell your information. We do not share customer details with ticket providers or other companies for their own marketing. Launch offers from participating providers are sent to you by InstaTickets.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Customer pre-registration details: until you activate an InstaTickets account, or [12] months after launch if you do not, then deleted.",
        "Business registration details: [24] months from your last contact with us, unless you become a partner, in which case your partner agreement applies.",
        "Contact form enquiries: [12] months after the enquiry is closed.",
      ],
    },
    {
      heading: "Your choices and rights",
      paragraphs: [
        "You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing messages at any time. Every marketing message will also tell you how to opt out.",
        'To make a request, email info@instatickets.co.zw with the subject "Data Request", or message us on WhatsApp at +263 772 270 533. We will respond within [30] days.',
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
