import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPrograms } from "@/content/programs";
import { DAY_KEYS } from "@/content/schema";

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

export default async function ProgramsListPage() {
  const programs = await getPrograms("tr");
  const byDay = DAY_KEYS.map((day) => ({
    day,
    items: programs
      .filter((p) => p.day === day)
      .sort((a, b) => a.startHour - b.startHour),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Yayınlar
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            Toplam {programs.length} yayın. Yeni yayın ekleyebilir veya
            mevcutları düzenleyebilirsin.
          </p>
        </div>
        <Button size="sm" className="rounded-full" render={<Link href="/admin/programs/new" />}>
          <Plus className="size-4" />
          Yeni Yayın
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        {byDay.map(({ day, items }) => (
          <section key={day}>
            <h3 className="border-b border-white/10 pb-2 font-serif text-lg font-semibold text-primary">
              {day}
            </h3>
            <ul className="mt-3 space-y-2">
              {items.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/admin/programs/${p.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/4 p-4 transition-[background-color,border-color] duration-150 hover:border-white/25 hover:bg-white/6"
                  >
                    <div
                      aria-hidden
                      className="size-10 shrink-0 rounded-lg"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, ${p.accentFrom}cc, ${p.accentTo}b3)`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">{p.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-foreground/60">
                        {p.tagline}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-foreground/55">
                      {formatHour(p.startHour)} – {formatHour(p.endHour)}
                    </span>
                    <ArrowRight className="size-4 text-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {byDay.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-foreground/60">
            Henüz yayın yok. Yukarıdaki “Yeni Yayın” düğmesinden başla.
          </p>
        )}
      </div>
    </div>
  );
}
