import { getTranslations } from "next-intl/server";

import { InstagramIcon } from "@/components/icons";
import { ProgramReminderBell } from "@/components/next-up";
import type { Program } from "@/content/programs";
import type { ScheduleWindow } from "@/content/schedule-window";

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatRange(p: Program) {
  return p.endHour - p.startHour === 1
    ? formatHour(p.startHour)
    : `${formatHour(p.startHour)} – ${formatHour(p.endHour)}`;
}

function accentStyle(p: Program): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(to bottom right, ${p.accentFrom}cc, ${p.accentTo}b3)`,
  };
}

type Props = {
  programs: Program[];
  window: ScheduleWindow;
};

export async function ScheduleList({ programs, window: w }: Props) {
  const t = await getTranslations("Schedule");
  const grouped = w.days
    .map((day) => ({
      day,
      items: programs
        .filter((p) => p.day === day.key)
        .sort((a, b) => a.startHour - b.startHour),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10 md:hidden">
      {grouped.map(({ day, items }) => (
        <section key={day.key}>
          <div className="mb-4 flex items-baseline justify-between border-b border-white/10 pb-2">
            <h2 className="text-xl font-semibold tracking-tight text-primary">
              {day.label}
            </h2>
            <span className="text-[11px] uppercase tracking-widest text-foreground/50">
              {t("broadcastsCount", { count: items.length })}
            </span>
          </div>
          <ul className="space-y-3">
            {items.map((p) => (
              <li
                key={p.slug}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-4 transition-[border-color,background-color] duration-200 active:border-white/20 active:bg-white/6"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
                  style={accentStyle(p)}
                />
                <ProgramReminderBell
                  slug={p.slug}
                  className="absolute top-3 right-3 z-20"
                />
                <div className="relative pr-10">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] tabular-nums text-foreground/55">
                    {formatRange(p)}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold leading-tight text-balance">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/65">{p.tagline}</p>
                  <p className="mt-3 text-[11px] text-foreground/55">
                    <span className="uppercase tracking-widest text-foreground/40">
                      {t("hostedBy")}{" "}
                    </span>
                    {p.hosts.join(", ")}
                  </p>
                  {p.instagramHandle && (
                    <a
                      href={`https://www.instagram.com/${p.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.title} Instagram`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-foreground/55 transition-colors hover:text-primary"
                    >
                      <InstagramIcon className="size-4" />@{p.instagramHandle}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
