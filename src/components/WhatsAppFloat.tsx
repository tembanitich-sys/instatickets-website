import { MessageCircle } from "lucide-react";
import { contact, nav } from "@content/site";

/** Floating WhatsApp button, rendered on every page from the root layout. */
export function WhatsAppFloat() {
  return (
    // A landmark, so the button is not left outside the page's regions.
    <aside aria-label={nav.whatsappButton}>
      <a
        href={contact.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={nav.whatsappButton}
        className="fixed bottom-4 right-4 z-50 inline-flex size-14 items-center justify-center gap-2 rounded-full bg-whatsapp text-white shadow-lg ring-2 ring-white transition-transform hover:scale-105 sm:h-14 sm:w-auto sm:px-5"
      >
        <MessageCircle aria-hidden className="size-7" />
        <span className="hidden text-sm font-bold tracking-wide sm:inline">{nav.whatsappButton}</span>
      </a>
    </aside>
  );
}
