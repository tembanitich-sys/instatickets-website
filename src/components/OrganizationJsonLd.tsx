import { contact } from "@content/site";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site-url";

/**
 * Organization structured data with the head office address. Only facts from the
 * brief are used: no social profiles, ratings or other details are invented.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "InstaTickets",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-full.png`,
    description: SITE_DESCRIPTION,
    email: contact.email,
    parentOrganization: { "@type": "Organization", name: "Bullion Technologies" },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${contact.address.street}, Belgravia`,
      addressLocality: "Harare",
      addressCountry: "ZW",
    },
    contactPoint: contact.mobiles.map((m) => ({
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: m.tel,
      email: contact.email,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so no value can close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
