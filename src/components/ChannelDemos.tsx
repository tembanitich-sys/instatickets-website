"use client";

import { useState } from "react";
import { channelDemo } from "@content/site";
import { ChannelIcon, type ChannelKey } from "./ChannelIcon";
import { BookingDemo } from "./BookingDemo";
import { UssdDemo } from "./UssdDemo";
import { WhatsAppDemo } from "./WhatsAppDemo";

type Key = "web" | "whatsapp" | "ussd";

/** Review-only demo: pick a channel (shown as an icon) and click through its journey. */
export function ChannelDemos({ channels, initialCompany }: { channels: React.ReactNode; initialCompany?: string }) {
  const [key, setKey] = useState<Key>("web");
  return (
    <div>
      <div role="tablist" aria-label="Channel" className="flex flex-wrap gap-3">
        {channelDemo.tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={key === tab.key}
            aria-label={tab.label}
            title={tab.label}
            onClick={() => setKey(tab.key as Key)}
            className={`rounded-2xl p-1.5 ring-2 transition ${key === tab.key ? "ring-red" : "opacity-70 ring-transparent hover:opacity-100"}`}
          >
            <ChannelIcon channel={tab.key as ChannelKey} size={56} />
          </button>
        ))}
      </div>
      <div className="mt-8">
        {key === "web" && <BookingDemo channels={channels} initialCompany={initialCompany} />}
        {key === "whatsapp" && <WhatsAppDemo />}
        {key === "ussd" && <UssdDemo />}
      </div>
    </div>
  );
}
