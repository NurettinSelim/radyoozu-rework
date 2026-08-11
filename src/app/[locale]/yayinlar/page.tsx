import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ScheduleGrid } from "@/components/schedule-grid";
import { ScheduleList } from "@/components/schedule-list";
import { getCopy } from "@/content/copy";
import { getPrograms } from "@/content/programs";
import { getScheduleWindow } from "@/content/schedule-window";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getCopy(locale);
  return {
    title: copy.yayinlar.metadataTitle,
    description: copy.yayinlar.metadataDescription,
  };
}

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [programs, scheduleWindow, copy, t] = await Promise.all([
    getPrograms(locale),
    getScheduleWindow(locale),
    getCopy(locale),
    getTranslations("Programs"),
  ]);
  const c = copy.yayinlar;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="enter-rise text-xs uppercase tracking-[0.25em] text-primary">
            {c.eyebrow}
          </p>
          <h1 className="enter-rise enter-delay-1 mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl md:text-6xl">
            {c.headline}
          </h1>
          <p className="enter-rise enter-delay-2 mt-4 text-base text-pretty text-foreground/70 sm:text-lg">
            {c.tagline}
          </p>
        </div>
        <Link
          href="/admin/programs"
          prefetch={false}
          className="enter-rise enter-delay-2 inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-foreground/60 transition-[background-color,border-color,color,scale] duration-150 ease-out hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-[0.96] md:self-auto"
        >
          <Pencil className="size-3.5" />
          {t("edit")}
        </Link>
      </header>

      <div className="enter-rise enter-delay-3 mt-12">
        <ScheduleGrid
          programs={programs}
          window={scheduleWindow}
          liveLegend={c.liveLegend}
          replayLegend={c.replayLegend}
        />
        <ScheduleList programs={programs} window={scheduleWindow} />
      </div>
    </div>
  );
}
