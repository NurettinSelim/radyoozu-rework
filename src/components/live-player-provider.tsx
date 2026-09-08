"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { DAY_KEYS, type DayKey } from "@/content/schema";
import { nextOccurrence } from "@/lib/next-broadcast";

export type NowPlaying = {
  status: "onair" | "offline" | string;
  title: string;
  artworkUrl?: string;
};

const INITIAL_VOLUME = 1.0;
const POLL_INTERVAL_MS = 20_000;
const REMINDERS_STORAGE_KEY = "radyoozu.reminders";
const FIRED_STORAGE_KEY = "radyoozu.reminders.fired";
const REMINDER_LEAD_MS = 10 * 60_000;

type Brand = { prefix: string; accent: string };

type Stream = { url: string; apiBase: string };

export type UpcomingProgram = {
  slug: string;
  title: string;
  day: DayKey;
  startHour: number;
};

function isUpcomingProgram(value: unknown): value is UpcomingProgram {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.day === "string" &&
    DAY_KEYS.includes(candidate.day as DayKey) &&
    typeof candidate.startHour === "number" &&
    Number.isInteger(candidate.startHour) &&
    candidate.startHour >= 0 &&
    candidate.startHour <= 23
  );
}

function subscribeToNotificationSupport() {
  return () => undefined;
}

function getNotificationSupportSnapshot() {
  return "Notification" in window;
}

function getServerNotificationSupportSnapshot() {
  return false;
}

type LivePlayerContextValue = {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  muted: boolean;
  volume: number;
  now: NowPlaying | null;
  upcoming: UpcomingProgram[];
  nextUp: { slug: string; title: string; start: Date } | null;
  clock: Date | null;
  reminders: string[];
  notificationSupported: boolean;
  toggleReminder: (slug: string) => Promise<void>;
  brand: Brand;
  fallbackTitle: string;
  toggle: () => void;
  toggleMuted: () => void;
  changeVolume: (v: number) => void;
};

async function fetchNowPlaying(apiBase: string): Promise<NowPlaying | null> {
  try {
    const [statusRes, trackRes] = await Promise.all([
      fetch(`${apiBase}/status`, { cache: "no-store" }),
      fetch(`${apiBase}/track/current`, { cache: "no-store" }),
    ]);
    const statusJson = (await statusRes.json()) as {
      data?: { status?: string };
    };
    const trackJson = (await trackRes.json()) as {
      data?: {
        title?: string;
        artwork_urls?: { standard?: string; large?: string };
      };
    };
    const title = trackJson.data?.title ?? "";
    const artworkUrl =
      trackJson.data?.artwork_urls?.large ??
      trackJson.data?.artwork_urls?.standard;
    return {
      status: statusJson.data?.status ?? "offline",
      title,
      artworkUrl,
    };
  } catch {
    return null;
  }
}

const LivePlayerContext = createContext<LivePlayerContextValue | null>(null);

type Props = {
  stream: Stream;
  brand: Brand;
  upcoming: UpcomingProgram[];
  children: React.ReactNode;
};

export function LivePlayerProvider({
  stream,
  brand,
  upcoming: initialUpcoming,
  children,
}: Props) {
  const t = useTranslations("Player");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(INITIAL_VOLUME);
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [clock, setClock] = useState<Date | null>(null);
  const [reminders, setReminders] = useState<string[]>([]);
  const notificationSupported = useSyncExternalStore(
    subscribeToNotificationSupport,
    getNotificationSupportSnapshot,
    getServerNotificationSupportSnapshot,
  );

  useEffect(() => {
    let active = true;
    let tickCount = 0;

    const refreshSchedule = async () => {
      try {
        const response = await fetch("/api/schedule");
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isUpcomingProgram) || !active) {
          return;
        }
        setUpcoming((previous) =>
          previous.length === data.length &&
          previous.every(
            (program, index) =>
              program.slug === data[index].slug &&
              program.title === data[index].title &&
              program.day === data[index].day &&
              program.startHour === data[index].startHour,
          )
            ? previous
            : data,
        );
      } catch {
        // Offline tabs keep using the last valid schedule.
      }
    };

    const tick = () => {
      setClock(new Date());
      tickCount += 1;
      if (tickCount % 10 === 0) void refreshSchedule();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshSchedule();
    };

    tick();
    const intervalId = setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const nextUp = useMemo(() => {
    if (clock === null) return null;
    const occurrence = nextOccurrence(upcoming, clock);
    if (occurrence === null) return null;
    return {
      slug: occurrence.item.slug,
      title: occurrence.item.title,
      start: occurrence.start,
    };
  }, [clock, upcoming]);

  useEffect(() => {
    if (clock === null) return;
    let active = true;

    const checkReminders = async () => {
      try {
        const storedRaw = localStorage.getItem(REMINDERS_STORAGE_KEY);
        let stored: string[] = [];
        if (storedRaw !== null) {
          const parsed: unknown = JSON.parse(storedRaw);
          if (Array.isArray(parsed)) {
            stored = [
              ...new Set(parsed.filter((slug): slug is string => typeof slug === "string")),
            ];
          }
        }

        const programBySlug = new Map(
          upcoming.map((program) => [program.slug, program]),
        );
        const valid = stored.filter((slug) => programBySlug.has(slug));
        if (
          storedRaw !== null &&
          (valid.length !== stored.length ||
            valid.some((slug, index) => slug !== stored[index]))
        ) {
          localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(valid));
        }

        let fired: Record<string, string> = {};
        const firedRaw = localStorage.getItem(FIRED_STORAGE_KEY);
        if (firedRaw !== null) {
          const parsed: unknown = JSON.parse(firedRaw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            fired = Object.fromEntries(
              Object.entries(parsed).filter(
                (entry): entry is [string, string] =>
                  typeof entry[1] === "string",
              ),
            );
          }
        }

        let firedChanged = false;
        for (const slug of Object.keys(fired)) {
          if (!programBySlug.has(slug)) {
            delete fired[slug];
            firedChanged = true;
          }
        }

        if (active) {
          setReminders((previous) =>
            previous.length === valid.length &&
            previous.every((slug, index) => slug === valid[index])
              ? previous
              : valid,
          );
        }

        if (
          !("Notification" in window) ||
          Notification.permission !== "granted" ||
          !("serviceWorker" in navigator)
        ) {
          if (firedChanged) {
            localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired));
          }
          return;
        }

        for (const slug of valid) {
          const program = programBySlug.get(slug);
          if (!program) continue;
          const occurrence = nextOccurrence([program], clock);
          if (!occurrence) continue;
          const startIso = occurrence.start.toISOString();
          const timeUntilStart = occurrence.start.getTime() - clock.getTime();
          if (
            timeUntilStart <= 0 ||
            timeUntilStart > REMINDER_LEAD_MS ||
            fired[slug] === startIso
          ) {
            continue;
          }

          await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          const registration = await navigator.serviceWorker.ready;
          if (!active) return;
          await registration.showNotification(
            t("notifTitle", { title: program.title }),
            {
              body: t("notifBody", {
                time: `${String(program.startHour).padStart(2, "0")}:00`,
              }),
              icon: "/icon.png",
              tag: slug,
            },
          );
          fired[slug] = startIso;
          firedChanged = true;
        }

        if (firedChanged) {
          localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired));
        }
      } catch {
        // Reminders must never interfere with live playback.
      }
    };

    void checkReminders();
    return () => {
      active = false;
    };
  }, [clock, t, upcoming]);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      const data = await fetchNowPlaying(stream.apiBase);
      if (!active || !data) return;
      setNow((prev) => {
        if (
          prev &&
          prev.status === data.status &&
          prev.title === data.title &&
          prev.artworkUrl === data.artworkUrl
        ) {
          return prev;
        }
        return data;
      });
    };

    const start = () => {
      if (intervalId !== null) return;
      load();
      intervalId = setInterval(load, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const shouldPoll = () =>
      document.visibilityState === "visible" || isPlayingRef.current;

    const onVisibility = () => {
      if (shouldPoll()) start();
      else stop();
    };

    if (shouldPoll()) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stream.apiBase]);

  const setAudioRef = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.volume = INITIAL_VOLUME;
  }, []);

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    setError(null);
    if (isPlayingRef.current) {
      el.pause();
      el.removeAttribute("src");
      el.load();
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }
    try {
      setIsLoading(true);
      el.src = `${stream.url}?_=${Date.now()}`;
      await el.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
    } catch {
      setError(t("errorStart"));
      isPlayingRef.current = false;
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [stream.url, t]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const changeVolume = useCallback((v: number) => {
    setMuted(v === 0);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleReminder = useCallback(
    async (slug: string) => {
      try {
        if (reminders.includes(slug)) {
          const nextReminders = reminders.filter((item) => item !== slug);
          localStorage.setItem(
            REMINDERS_STORAGE_KEY,
            JSON.stringify(nextReminders),
          );
          setReminders(nextReminders);
          toast(t("notifRemoved"));
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error(t("notifDenied"));
          return;
        }

        const nextReminders = [...reminders, slug];
        localStorage.setItem(
          REMINDERS_STORAGE_KEY,
          JSON.stringify(nextReminders),
        );
        setReminders(nextReminders);
        toast.success(t("notifSet"));
      } catch {
        toast.error(t("notifError"));
      }
    },
    [reminders, t],
  );

  const fallbackTitle = `${brand.prefix}${brand.accent}`.trim();

  const value: LivePlayerContextValue = {
    isPlaying,
    isLoading,
    error,
    muted,
    volume,
    now,
    upcoming,
    nextUp,
    clock,
    reminders,
    notificationSupported,
    brand,
    fallbackTitle,
    toggle,
    toggleMuted,
    changeVolume,
    toggleReminder,
  };

  return (
    <LivePlayerContext.Provider value={value}>
      {children}
      <audio
        ref={setAudioRef}
        preload="none"
        muted={muted}
        onEnded={() => {
          isPlayingRef.current = false;
          setIsPlaying(false);
        }}
        onError={() => {
          const el = audioRef.current;
          // Detaching the source on stop can fire `error`; ignore when no src is set.
          if (!el || !el.getAttribute("src")) return;
          setError(t("errorDisconnected"));
          isPlayingRef.current = false;
          setIsPlaying(false);
        }}
      />
    </LivePlayerContext.Provider>
  );
}

export function useLivePlayer(): LivePlayerContextValue {
  const ctx = useContext(LivePlayerContext);
  if (!ctx) {
    throw new Error("useLivePlayer must be used within a LivePlayerProvider");
  }
  return ctx;
}
