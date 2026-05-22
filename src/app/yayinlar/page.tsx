import type { Metadata } from "next";

import { ScheduleGrid } from "@/components/schedule-grid";
import { ScheduleList } from "@/components/schedule-list";
import { getCopy } from "@/content/copy";
import { getPrograms } from "@/content/programs";
import { getScheduleWindow } from "@/content/schedule-window";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return {
    title: copy.yayinlar.metadataTitle,
    description: copy.yayinlar.metadataDescription,
  };
}

export default async function ProgramsPage() {
  const [programs, scheduleWindow, copy] = await Promise.all([
    getPrograms(),
    getScheduleWindow(),
    getCopy(),
  ]);
  const c = copy.yayinlar;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="enter-rise text-xs uppercase tracking-[0.25em] text-primary">
            {c.eyebrow}
          </p>
          <h1 className="enter-rise enter-delay-1 mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl md:text-6xl">
            {c.headline}
          </h1>
          <p className="enter-rise enter-delay-2 mt-4 text-base text-pretty text-foreground/70 sm:text-lg">
            {c.tagline}
          </p>
        </div>
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
