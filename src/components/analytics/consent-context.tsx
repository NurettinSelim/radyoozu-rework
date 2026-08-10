"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

export type Consent = "granted" | "denied";

const COOKIE = "radyoozu-analytics-consent";
const ONE_YEAR = 60 * 60 * 24 * 365;

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function readConsentCookie(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    /(?:^|;\s*)radyoozu-analytics-consent=(granted|denied)/,
  );
  return match ? (match[1] as Consent) : null;
}

// Server render (and the static HTML) always reports "undecided"; the client
// reads the real cookie after hydration. This keeps the locale pages statically
// prerenderable — no `cookies()` call that would force dynamic rendering.
function getServerSnapshot(): Consent | null {
  return null;
}

function writeConsent(value: Consent) {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
  listeners.forEach((listener) => listener());
}

type ConsentContextValue = {
  /** `null` until the visitor has made a choice. */
  consent: Consent | null;
  accept: () => void;
  reject: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(
    subscribe,
    readConsentCookie,
    getServerSnapshot,
  );

  const accept = useCallback(() => writeConsent("granted"), []);
  const reject = useCallback(() => writeConsent("denied"), []);

  return (
    <ConsentContext.Provider value={{ consent, accept, reject }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}
