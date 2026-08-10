"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useConsent } from "./consent-context";

export function ConsentBanner() {
  const t = useTranslations("Consent");
  const { consent, accept, reject } = useConsent();

  // Only show while the choice is still undecided.
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-background/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{t("title")}</p>
          <p className="mt-0.5 text-sm text-pretty text-foreground/70">
            {t("description")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reject}
            className="flex-1 sm:flex-none"
          >
            {t("reject")}
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="flex-1 sm:flex-none"
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
