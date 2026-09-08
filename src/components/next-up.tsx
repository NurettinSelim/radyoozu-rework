"use client";

import { useMemo } from "react";
import { Bell, BellRing, CalendarPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useLivePlayer } from "@/components/live-player-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NextUpLineProps = {
  className?: string;
};

export function NextUpLine({ className }: NextUpLineProps) {
  const locale = useLocale();
  const t = useTranslations("Player");
  const { nextUp, now, clock } = useLivePlayer();
  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric: "always" }),
    [locale],
  );

  const formattedStart = useMemo(() => {
    if (nextUp === null) return null;

    const weekday = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      timeZone: "Europe/Istanbul",
    }).format(nextUp.start);
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Istanbul",
    }).format(nextUp.start);

    return { weekday, time };
  }, [locale, nextUp]);

  if (
    nextUp === null ||
    formattedStart === null ||
    clock === null ||
    now?.status === "onair"
  ) {
    return null;
  }

  const diffMs = Math.max(0, nextUp.start.getTime() - clock.getTime());
  let relative: string;
  if (diffMs < 60 * 60_000) {
    relative = relativeFormatter.format(Math.ceil(diffMs / 60_000), "minute");
  } else if (diffMs < 48 * 60 * 60_000) {
    relative = relativeFormatter.format(
      Math.ceil(diffMs / (60 * 60_000)),
      "hour",
    );
  } else {
    relative = relativeFormatter.format(
      Math.ceil(diffMs / (24 * 60 * 60_000)),
      "day",
    );
  }

  return (
    <p
      className={cn("text-sm text-pretty text-foreground/60", className)}
    >
      {t("nextUp")}: {nextUp.title} · {formattedStart.weekday}{" "}
      <span className="tabular-nums">{formattedStart.time}</span> · {relative}
    </p>
  );
}

type ProgramReminderBellProps = {
  slug: string;
  showLabel?: boolean;
  className?: string;
};

export function ProgramReminderBell({
  slug,
  showLabel = false,
  className,
}: ProgramReminderBellProps) {
  const t = useTranslations("Player");
  const {
    reminders,
    notificationSupported,
    toggleReminder,
  } = useLivePlayer();
  const active = reminders.includes(slug);

  if (!notificationSupported) return null;

  const label = active ? t("remindOn") : t("remind");

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon-sm"}
      onClick={() => void toggleReminder(slug)}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "relative transition-[background-color,color,border-color,box-shadow,scale,opacity]",
        showLabel
          ? "min-h-10"
          : "after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        active ? "text-primary" : "text-foreground/55",
        className,
      )}
    >
      <span className="relative flex size-4 items-center justify-center">
        <Bell
          className={cn(
            "size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            active
              ? "scale-[0.25] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0",
          )}
        />
        <BellRing
          className={cn(
            "absolute size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            active
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]",
          )}
        />
      </span>
      {showLabel ? label : null}
    </Button>
  );
}

type ReminderActionsProps = {
  variant: "hero" | "mini";
};

export function ReminderActions({ variant }: ReminderActionsProps) {
  const t = useTranslations("Player");
  const { nextUp, now } = useLivePlayer();

  if (nextUp === null || now?.status === "onair") return null;

  const hero = variant === "hero";

  return (
    <div className={cn("flex items-center", hero ? "mt-3 gap-2" : "gap-1")}>
      <ProgramReminderBell slug={nextUp.slug} showLabel={hero} />
      <Button
        render={
          <a
            download
            href={`/api/reminder/ics?slug=${encodeURIComponent(nextUp.slug)}`}
          />
        }
        nativeButton={false}
        variant="ghost"
        size={hero ? "sm" : "icon-sm"}
        aria-label={t("addToCalendar")}
        className={cn(
          "relative text-foreground/55 hover:text-foreground",
          hero
            ? "min-h-10"
            : "after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
        )}
      >
        <CalendarPlus className="size-4" />
        {hero ? t("addToCalendar") : null}
      </Button>
    </div>
  );
}
