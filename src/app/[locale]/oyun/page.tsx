import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  WhackAMole,
  type MoleTarget,
} from "@/components/whack-a-mole";
import { getPrograms } from "@/content/programs";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

function hostInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second =
    parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : (parts[0]?.[1] ?? "");
  return (first + second).toLocaleUpperCase("tr");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Game" });
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: pageAlternates(locale, "/oyun"),
  };
}

export default async function GamePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [programs, t] = await Promise.all([
    getPrograms(locale),
    getTranslations("Game"),
  ]);

  const rosterByName = new Map<string, MoleTarget>();
  for (const program of programs) {
    for (const name of program.hosts) {
      if (!rosterByName.has(name)) {
        rosterByName.set(name, {
          name,
          initials: hostInitials(name),
          from: program.accentFrom,
          to: program.accentTo,
        });
      }
    }
  }

  const targets = Array.from(rosterByName.values());
  if (targets.length === 0) {
    targets.push({
      name: "Radyo ÖzÜ",
      initials: "ÖÜ",
      from: "#bb205d",
      to: "#462155",
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 [@media(max-height:800px)]:py-8 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <header>
          <p className="enter-rise text-xs uppercase tracking-[0.25em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="enter-rise enter-delay-1 mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl md:text-6xl">
            {t("headline")}
          </h1>
          <p className="enter-rise enter-delay-2 mt-4 text-base text-pretty text-foreground/70 sm:text-lg">
            {t("tagline")}
          </p>
        </header>

        <div className="enter-rise enter-delay-3 mt-10 [@media(max-height:800px)]:mt-6 sm:mt-12">
          <WhackAMole targets={targets} />
        </div>
      </div>
    </div>
  );
}
