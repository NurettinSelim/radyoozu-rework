"use client";

import { GoogleAnalytics } from "@next/third-parties/google";

import { useConsent } from "./consent-context";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Mounts Google Analytics only once the visitor has granted consent and a
 * measurement id is configured. Until then no GA script or cookie is loaded —
 * the strictest reading of KVKK/GDPR. GA is intentionally absent on Preview
 * deployments and locally, since `NEXT_PUBLIC_GA_ID` is only set in Production.
 */
export function Analytics() {
  const { consent } = useConsent();
  if (!GA_ID || consent !== "granted") return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
