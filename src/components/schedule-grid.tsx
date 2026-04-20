"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Program } from "@/content/programs";

const DAYS: { key: Program["day"]; label: string; short: string }[] = [
  { key: "Pazartesi", label: "Pazartesi", short: "Pzt" },
  { key: "Salı", label: "Salı", short: "Sal" },
  { key: "Çarşamba", label: "Çarşamba", short: "Çar" },
  { key: "Perşembe", label: "Perşembe", short: "Per" },
];

const START_HOUR = 18;
const END_HOUR = 22;
const ROW_COUNT = END_HOUR - START_HOUR;
const ROW_HEIGHT = 128;

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatRange(p: Program) {
  return p.endHour - p.startHour === 1
    ? formatHour(p.startHour)
    : `${formatHour(p.startHour)} – ${formatHour(p.endHour)}`;
}

function jsDayToColumn(jsDay: number): number | null {
  switch (jsDay) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return 2;
    case 4:
      return 3;
    default:
      return null;
  }
}

export function ScheduleGrid({ programs }: { programs: Program[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const { todayCol, hourNow, inRange } = useMemo(() => {
    if (!now) return { todayCol: null, hourNow: null, inRange: false };
    const col = jsDayToColumn(now.getDay());
    const h = now.getHours() + now.getMinutes() / 60;
    return {
      todayCol: col,
      hourNow: h,
      inRange: col !== null && h >= START_HOUR && h <= END_HOUR,
    };
  }, [now]);

  return (
    <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-background/40 shadow-2xl shadow-black/30 md:block">
      {/* Day header row */}
      <div
        className="grid border-b border-white/10"
        style={{ gridTemplateColumns: `76px repeat(4, minmax(0, 1fr))` }}
      >
        <div aria-hidden className="bg-white/[0.015]" />
        {DAYS.map((d, i) => {
          const isToday = i === todayCol;
          return (
            <div
              key={d.key}
              className={cn(
                "flex items-center justify-between gap-2 border-l border-white/10 px-4 py-4",
                isToday && "bg-amber-300/[0.06]",
              )}
            >
              <span
                className={cn(
                  "font-serif text-base font-semibold tracking-tight",
                  isToday ? "text-amber-100" : "text-foreground/80",
                )}
              >
                {d.label}
              </span>
              {isToday && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                  <span className="size-1.5 animate-pulse rounded-full bg-amber-300" />
                  Bugün
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule body */}
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `76px repeat(4, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROW_COUNT}, ${ROW_HEIGHT}px)`,
        }}
      >
        {/* Today column tint (spans full height) */}
        {todayCol !== null && (
          <div
            aria-hidden
            className="pointer-events-none bg-gradient-to-b from-amber-300/[0.04] to-transparent"
            style={{
              gridColumn: todayCol + 2,
              gridRow: `1 / span ${ROW_COUNT}`,
            }}
          />
        )}

        {/* Hour labels */}
        {Array.from({ length: ROW_COUNT }, (_, i) => (
          <div
            key={`hour-${i}`}
            className={cn(
              "relative flex items-start justify-end pr-3 pt-2 text-[11px] font-medium tabular-nums text-foreground/40",
              i > 0 && "border-t border-white/10",
            )}
            style={{ gridColumn: 1, gridRow: i + 1 }}
          >
            {formatHour(START_HOUR + i)}
          </div>
        ))}

        {/* Background day cells (for borders) */}
        {DAYS.map((d, colIdx) =>
          Array.from({ length: ROW_COUNT }, (_, rowIdx) => (
            <div
              key={`bg-${d.key}-${rowIdx}`}
              className={cn(
                "border-l border-white/5",
                rowIdx > 0 && "border-t border-white/10",
              )}
              style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 1 }}
            />
          )),
        )}

        {/* Now cursor */}
        {inRange && hourNow !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-[76px] right-0 z-[5] flex items-center"
            style={{ top: (hourNow - START_HOUR) * ROW_HEIGHT }}
          >
            <div className="-ml-[5px] size-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgb(252_211_77_/_0.7)]" />
            <div className="h-px flex-1 bg-gradient-to-r from-amber-300 via-amber-300/40 to-transparent" />
          </div>
        )}

        {/* Show blocks */}
        {programs.map((p) => {
          const colIdx = DAYS.findIndex((d) => d.key === p.day);
          if (colIdx < 0) return null;

          const startClamped = Math.max(START_HOUR, p.startHour);
          const endClamped = Math.min(END_HOUR, p.endHour);
          const rowStart = startClamped - START_HOUR + 1;
          const rowSpan = Math.max(1, endClamped - startClamped);

          const isLive =
            todayCol === colIdx &&
            hourNow !== null &&
            hourNow >= p.startHour &&
            hourNow < p.endHour;

          return (
            <article
              key={p.slug}
              className={cn(
                "group relative z-10 m-1.5 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition duration-200",
                "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/40",
                isLive &&
                  "border-amber-300/60 ring-1 ring-amber-300/40 ring-offset-0",
              )}
              style={{
                gridColumn: colIdx + 2,
                gridRow: `${rowStart} / span ${rowSpan}`,
              }}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-14 -right-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-35 blur-2xl transition group-hover:opacity-55",
                  p.accent,
                )}
              />
              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] tabular-nums text-foreground/55">
                    {formatRange(p)}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-widest text-amber-200">
                      <span className="size-1 animate-pulse rounded-full bg-amber-300" />
                      Canlı
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 font-serif text-[1.05rem] font-semibold leading-[1.15] tracking-tight text-foreground">
                  {p.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-foreground/65">
                  {p.tagline}
                </p>
                <p className="mt-auto truncate pt-2 text-[11px] text-foreground/50">
                  {p.hosts.join(", ")}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-[11px] text-foreground/50">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgb(252_211_77_/_0.7)]" />
            Şu an canlı
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground/30" />
            Haftalık tekrar
          </span>
        </div>
        <span className="tabular-nums">{programs.length} yayın · Pzt – Per</span>
      </div>
    </div>
  );
}
