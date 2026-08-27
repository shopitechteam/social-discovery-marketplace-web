"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records first-touch attribution on the very first page the visitor lands on.
 * Renders nothing; mounted once from the locale layout.
 */
export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
