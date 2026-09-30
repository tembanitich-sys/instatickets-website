"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/** Renders nothing; remembers campaign tags from the landing URL for the forms. */
export function UtmCapture() {
  useEffect(() => captureUtm(window.location.search), []);
  return null;
}
