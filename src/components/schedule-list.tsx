import { cn } from "@/lib/utils";
import type { Program } from "@/content/programs";

const DAY_ORDER: Program["day"][] = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatRange(p: Program) {
  return p.endHour - p.startHour === 1
    ? formatHour(p.startHour)
    : `${formatHour(p.startHour)} – ${formatHour(p.endHour)}`;
}

export function ScheduleList({ programs }: { programs: Program[] }) {
  const grouped = DAY_ORDER.map((day) => ({
    day,
    items: programs
      .filter((p) => p.day === day)
      .sort((a, b) => a.startHour - b.startHour),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10 md:hidden">
      {grouped.map(({ day, items }) => (
        <section key={day}>
          <div className="mb-4 flex items-baseline justify-between border-b border-white/10 pb-2">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-amber-200">
              {day}
            </h2>
            <span className="text-[11px] uppercase tracking-widest text-foreground/50">
              {items.length} yayın
            </span>
          </div>
          <ul className="space-y-3">
            {items.map((p) => (
              <li
                key={p.slug}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-30 blur-2xl",
                    p.accent,
                  )}
                />
                <div className="relative">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] tabular-nums text-foreground/55">
                    {formatRange(p)}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-semibold leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/65">{p.tagline}</p>
                  <p className="mt-3 text-[11px] text-foreground/55">
                    <span className="uppercase tracking-widest text-foreground/40">
                      Sunan ·{" "}
                    </span>
                    {p.hosts.join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
