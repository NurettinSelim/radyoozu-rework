import { sendGAEvent } from "@next/third-parties/google";

export type AnalyticsEventParams = Record<string, string | number | boolean>;

/**
 * Forward a custom event to Google Analytics 4.
 *
 * No-ops until GA has actually been loaded — which only happens after the
 * visitor grants consent (see `analytics.tsx`). Before that `window.dataLayer`
 * is absent, so events are silently dropped rather than queued.
 */
export function trackEvent(name: string, params?: AnalyticsEventParams) {
  if (typeof window === "undefined") return;
  if (!("dataLayer" in window)) return;
  sendGAEvent("event", name, params ?? {});
}
