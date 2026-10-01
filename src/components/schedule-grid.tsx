"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { InstagramIcon } from "@/components/icons";
import { ProgramReminderBell } from "@/components/next-up";
import type { DayKey } from "@/content/schema";
import type { Program } from "@/content/programs";
import type { ScheduleWindow } from "@/content/schedule-window";

const ROW_HEIGHT = 172;

const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: "Pazar",
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
  6: "Cumartesi",
};

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
  liveLabel?: string;
  liveLegend?: string;
  replayLegend?: string;
};

export function ScheduleGrid({
  programs,
  window: w,
  liveLabel,
  liveLegend = "Şu an canlı",
  replayLegend = "Haftalık tekrar",
}: Props) {
  const t = useTranslations("Schedule");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const rowCount = w.endHour - w.startHour;
  const days = w.days;

  const { todayCol, hourNow, inRange } = useMemo(() => {
    if (!now) return { todayCol: null as number | null, hourNow: null as number | null, inRange: false };
    const todayKey = JS_DAY_TO_KEY[now.getDay()];
    const col = days.findIndex((d) => d.key === todayKey);
    const h = now.getHours() + now.getMinutes() / 60;
    return {
      todayCol: col >= 0 ? col : null,
      hourNow: h,
      inRange: col >= 0 && h >= w.startHour && h <= w.endHour,
    };
  }, [now, days, w.startHour, w.endHour]);

  const colCount = days.length;

  return (
    <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-background/40 shadow-2xl shadow-black/30 md:block">
      {/* Day header row */}
      <div
        className="grid border-b border-white/10"
        style={{ gridTemplateColumns: `76px repeat(${colCount}, minmax(0, 1fr))` }}
      >
        <div aria-hidden className="bg-white/[0.015]" />
        {days.map((d, i) => {
          const isToday = i === todayCol;
          return (
            <div
              key={d.key}
              className={cn(
                "flex items-center justify-between gap-2 border-l border-white/10 px-4 py-4",
                isToday && "bg-primary/[0.08]",
              )}
            >
              <span
                className={cn(
                  "text-base font-semibold tracking-tight",
                  isToday ? "text-[#f4eaca]" : "text-foreground/80",
                )}
              >
                {d.label}
              </span>
              {isToday && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                  {t("today")}
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
          gridTemplateColumns: `76px repeat(${colCount}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rowCount}, ${ROW_HEIGHT}px)`,
        }}
      >
        {/* Today column tint (spans full height) */}
        {todayCol !== null && (
          <div
            aria-hidden
            className="pointer-events-none bg-gradient-to-b from-primary/[0.08] to-transparent"
            style={{
              gridColumn: todayCol + 2,
              gridRow: `1 / span ${rowCount}`,
            }}
          />
        )}

        {/* Hour labels */}
        {Array.from({ length: rowCount }, (_, i) => (
          <div
            key={`hour-${i}`}
            className={cn(
              "relative flex items-start justify-end pr-3 pt-2 text-[11px] font-medium tabular-nums text-foreground/40",
              i > 0 && "border-t border-white/10",
            )}
            style={{ gridColumn: 1, gridRow: i + 1 }}
          >
            {formatHour(w.startHour + i)}
          </div>
        ))}

        {/* Background day cells (for borders) */}
        {days.map((d, colIdx) =>
          Array.from({ length: rowCount }, (_, rowIdx) => (
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
            style={{ top: (hourNow - w.startHour) * ROW_HEIGHT }}
          >
            <div className="-ml-[5px] size-2.5 rounded-full bg-primary shadow-[0_0_12px_rgb(187_32_93_/_0.7)]" />
            <div className="h-px flex-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
          </div>
        )}

        {/* Show blocks */}
        {programs.map((p) => {
          const colIdx = days.findIndex((d) => d.key === p.day);
          if (colIdx < 0) return null;

          const startClamped = Math.max(w.startHour, p.startHour);
          const endClamped = Math.min(w.endHour, p.endHour);
          const rowStart = startClamped - w.startHour + 1;
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
                "group relative z-10 m-1.5 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/4 p-4 transition duration-200",
                "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/7 hover:shadow-xl hover:shadow-black/40",
                isLive &&
                  "border-primary/60 ring-1 ring-primary/40 ring-offset-0",
              )}
              style={{
                gridColumn: colIdx + 2,
                gridRow: `${rowStart} / span ${rowSpan}`,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-14 -right-10 h-40 w-40 rounded-full opacity-35 blur-2xl transition group-hover:opacity-55"
                style={accentStyle(p)}
              />
              <ProgramReminderBell
                slug={p.slug}
                className="absolute top-3 right-3 z-20"
              />
              <div className="relative flex flex-1 flex-col pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] tabular-nums text-foreground/55">
                    {formatRange(p)}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-widest text-primary">
                      <span className="size-1 animate-pulse rounded-full bg-primary" />
                      {liveLabel ?? t("liveLabel")}
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-[1.05rem] font-semibold leading-[1.15] tracking-tight text-balance text-foreground">
                  {p.title}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-xs leading-snug text-foreground/65",
                    rowSpan === 1 ? "line-clamp-1" : "line-clamp-2",
                  )}
                >
                  {p.tagline}
                </p>
                <p
                  className={cn(
                    "mt-auto pt-2 text-[11px] leading-tight text-foreground/50",
                    rowSpan === 1 ? "line-clamp-1" : "line-clamp-2",
                  )}
                >
                  {p.hosts.join(", ")}
                </p>
                {p.instagramHandle && (
                  <a
                    href={`https://www.instagram.com/${p.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.title} Instagram`}
                    className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-[11px] text-foreground/55 transition-colors hover:text-primary"
                  >
                    <InstagramIcon className="size-3.5" />@{p.instagramHandle}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-[11px] text-foreground/50">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgb(187_32_93_/_0.7)]" />
            {liveLegend}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground/30" />
            {replayLegend}
          </span>
        </div>
        <span className="tabular-nums">
          {t("broadcastsCount", { count: programs.length })} · {days[0]?.short} –{" "}
          {days[days.length - 1]?.short}
        </span>
      </div>
    </div>
  );
}
