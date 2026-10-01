/**
 * All page copy lives here (brief Appendix A and B). Edit wording in this file
 * only; components read from it and contain no marketing text of their own.
 */

export const LAUNCH_LABEL = "15 November 2026";

export const PRIVACY_NOTICE_VERSION = "2026-10-01-agents";

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
    { label: "Agents", href: "/agents" },
    { label: "Help", href: "/help" },
    { label: "Contact", href: "/contact" },
  ],
  join: { label: "JOIN INSTATICKETS", href: "/#join" },
  registerBusiness: { label: "REGISTER YOUR BUSINESS", href: "/for-businesses#register" },
  whatsappButton: "CHAT ON WHATSAPP",
} as const;

export const footer = {
  tagline: "One Platform. Every Ticket.",
  launching: "Launching 15 November 2026",
  whatsappLink: "Chat on WhatsApp",
  groups: [
    {
      heading: "PLATFORM",
      links: [
        { label: "Home", href: "/" },
        { label: "Bus Tickets", href: "/#bus" },
        { label: "Event Tickets", href: "/#events" },
        { label: "Sports Tickets", href: "/#sports" },
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
        { label: "Pre-Launch Privacy Notice", href: "/privacy" },
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
  inPerson: {
    heading: "InstaTickets in person",
    body: "InstaTickets is not only online. We are building a network of registered InstaTickets Agents, so customers can buy tickets in person, with or without a smartphone.",
    subHeading: "Become an InstaTickets Agent",
    subBody:
      "Turn your shop, office or stall into a ticket point and earn commission on every ticket you sell for participating providers.",
    button: "BECOME AN AGENT",
  },
  offers: {
    heading: "Early access benefits",
    body: "Pre-register now to be ready when InstaTickets goes live on 15 November 2026.",
    cards: [
      {
        key: "access",
        title: "EARLY ACCESS",
        body: "Be among the first invited to activate your account when InstaTickets goes live.",
      },
      {
        key: "offers",
        title: "LAUNCH OFFERS",
        body: "Participating providers may offer launch promotions to pre-registered users.",
      },
      {
        key: "updates",
        title: "UPDATES",
        body: "Hear about new providers, routes, events and features as they join InstaTickets.",
      },
    ],
    note: "Launch offers depend on provider participation and availability.",
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
      "InstaTickets is a Bullion Technologies product.",
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
  privacy: "Please confirm that you have read the Pre-Launch Privacy Notice.",
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
    privacyLink: "Pre-Launch Privacy Notice",
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
    privacyLink: "Pre-Launch Privacy Notice",
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
  effectiveDate: "1 October 2026",
  intro:
    "This notice explains how InstaTickets handles the personal information you give us through this website before the InstaTickets platform launches on 15 November 2026. A full Privacy Policy will be published at launch.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "InstaTickets is a Bullion Technologies product, operated by [EXACT REGISTERED NAME], 153 Sam Nujoma Street Extension, Belgravia, Harare, Zimbabwe. [EXACT REGISTERED NAME] is responsible for the information described in this notice.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "Customer pre-registration: first name, last name, mobile number, email address (if you give it), the ticket categories you are interested in, and whether you want marketing messages.",
        "Business registration: organisation name, contact person, mobile number, email address, business type, the tickets you want to offer, details of any existing ticketing system, and anything you tell us about your tickets.",
        "Agent applications: your name, mobile number, email address (if you give it), applicant type, business name, location, where you would sell, whether you have a device for sales, and anything you tell us about your business.",
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
        "To assess and respond to InstaTickets Agent applications.",
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
        "Agent applications: [24] months from your last contact with us, unless you become an agent, in which case your agent agreement applies.",
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
