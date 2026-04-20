import type { Metadata } from "next";

import { ScheduleGrid } from "@/components/schedule-grid";
import { ScheduleList } from "@/components/schedule-list";
import { programs } from "@/content/programs";

export const metadata: Metadata = {
  title: "Haftalık Yayınlar",
  description:
    "Radyo Özü'nün 2025-26 sezonu haftalık yayın akışı: B-Side, Pazartesi Sendromu Old School, Hayali Arkadaş, Romantik Komedi, Jacket Radio, Neler Oluyor Hayatta, Developer Log ve Yan Komşu.",
};

export default function ProgramsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            2025 – 26 Sezonu
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Haftalık Program Akışı
          </h1>
          <p className="mt-4 text-base text-foreground/70 sm:text-lg">
            Haftanın her akşamı stüdyoda farklı bir ses. Canlı dinlemek için
            Canlı Yayın sayfamıza göz at — aşağıda kaçırılmayacak saatler.
          </p>
        </div>
      </header>

      <div className="mt-12">
        <ScheduleGrid programs={programs} />
        <ScheduleList programs={programs} />
      </div>
    </div>
  );
}
