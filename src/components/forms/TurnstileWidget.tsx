"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { TURNSTILE_FIELD, getTurnstileSiteKey } from "@/lib/turnstile";

type TurnstileApi = {
  render(
    el: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  remove(id: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile. The token lands in a hidden field and is verified again
 * on the server. Mount it with a new `key` to get a fresh challenge (a token
 * can be used once).
 */
export function TurnstileWidget() {
  const siteKey = getTurnstileSiteKey();
  const container = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!scriptReady || !siteKey || !container.current || !window.turnstile) return;
    const id = window.turnstile.render(container.current, {
      sitekey: siteKey,
      callback: setToken,
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
    return () => window.turnstile?.remove(id);
  }, [scriptReady, siteKey]);

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      {/* Reserve the widget's height so the form does not jump when it loads. */}
      <div ref={container} className="min-h-[65px]" />
      <input type="hidden" name={TURNSTILE_FIELD} value={token} readOnly />
    </div>
  );
}
