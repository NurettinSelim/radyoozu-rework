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
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000];
const STALL_WATCHDOG_MS = 8_000;
const REMINDERS_STORAGE_KEY = "radyoozu.reminders";
const FIRED_STORAGE_KEY = "radyoozu.reminders.fired";
const REMINDER_LEAD_MS = 10 * 60_000;

type Brand = { prefix: string; accent: string };

type Stream = { url: string; apiBase: string };

type PlaybackStatus =
  | "idle"
  | "paused"
  | "connecting"
  | "playing"
  | "reconnecting";

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
  isActive: boolean;
  isReconnecting: boolean;
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
  const statusRef = useRef<PlaybackStatus>("idle");
  const intentRef = useRef<"play" | "stop">("stop");
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<number | undefined>(undefined);
  const watchdogTimerRef = useRef<number | undefined>(undefined);
  const connectGenerationRef = useRef(0);
  const volumeRef = useRef(INITIAL_VOLUME);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
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
      document.visibilityState === "visible" || intentRef.current === "play";

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
    if (el) el.volume = volumeRef.current;
  }, []);

  const engine = useMemo(() => {
    const setPlaybackStatus = (next: PlaybackStatus) => {
      statusRef.current = next;
      setStatus(next);
    };

    const clearTimers = () => {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = undefined;
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = undefined;
    };

    function teardown(message?: string) {
      intentRef.current = "stop";
      clearTimers();
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
      setPlaybackStatus("idle");
      if (message) setError(message);
    }

    function scheduleRetry() {
      if (intentRef.current !== "play") return;
      setPlaybackStatus("reconnecting");
      if (retryTimerRef.current !== undefined) return;
      // Offline: wait for the `online` event instead of burning attempts.
      if (navigator.onLine === false) return;
      retryAttemptRef.current += 1;
      if (retryAttemptRef.current > RETRY_DELAYS_MS.length) {
        teardown(t("errorDisconnected"));
        return;
      }
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = undefined;
        void connect();
      }, RETRY_DELAYS_MS[retryAttemptRef.current - 1]);
    }

    function handleFailure(fatal: boolean) {
      if (intentRef.current !== "play") return;
      // A failed first start (or a lost user gesture) cannot be fixed by
      // retrying; surface it instead of spinning.
      if (
        fatal ||
        (retryAttemptRef.current === 0 && statusRef.current === "connecting")
      ) {
        teardown(t("errorStart"));
        return;
      }
      scheduleRetry();
    }

    // Every start is a fresh connection to the live edge. Resuming an
    // attached live stream replays a stale buffer and splices new audio onto
    // it, which is audible as clipped/garbled playback.
    async function connect() {
      const el = audioRef.current;
      if (!el) return;
      const generation = ++connectGenerationRef.current;
      clearTimers();
      el.pause();
      el.src = `${stream.url}?_=${Date.now()}`;
      el.load();
      try {
        await el.play();
      } catch (err) {
        // Superseded by a newer connect; its own outcome drives state.
        if (generation !== connectGenerationRef.current) return;
        handleFailure(
          err instanceof DOMException && err.name === "NotAllowedError",
        );
      }
    }

    const play = () => {
      intentRef.current = "play";
      retryAttemptRef.current = 0;
      setError(null);
      setPlaybackStatus("connecting");
      void connect();
    };

    // Keeps `src` attached so the OS Now Playing entry survives a pause.
    const pause = () => {
      intentRef.current = "stop";
      clearTimers();
      audioRef.current?.pause();
      setPlaybackStatus("paused");
    };

    const toggle = () => {
      if (intentRef.current === "play") pause();
      else play();
    };

    const onStall = () => {
      if (intentRef.current !== "play") return;
      if (statusRef.current === "playing") setPlaybackStatus("reconnecting");
      if (watchdogTimerRef.current !== undefined) return;
      watchdogTimerRef.current = window.setTimeout(() => {
        watchdogTimerRef.current = undefined;
        scheduleRetry();
      }, STALL_WATCHDOG_MS);
    };

    const audioHandlers = {
      onPlaying: () => {
        if (intentRef.current !== "play") return;
        clearTimers();
        retryAttemptRef.current = 0;
        setError(null);
        setPlaybackStatus("playing");
      },
      // Native `play`/`pause` events can come from our own calls or from
      // external control (lock screen, headset keys, browser media controls).
      // Ours always run with a matching intent; `paused` at dispatch time
      // filters events made stale by a later call.
      onPlay: (event: React.SyntheticEvent<HTMLAudioElement>) => {
        if (intentRef.current === "play" || event.currentTarget.paused) return;
        // External resume on a stale buffer: reconnect to the live edge.
        play();
      },
      onPause: (event: React.SyntheticEvent<HTMLAudioElement>) => {
        const el = event.currentTarget;
        if (intentRef.current !== "play" || !el.paused) return;
        // `ended` and media errors are followed by a native pause; their own
        // handlers decide what happens next.
        if (el.ended || el.error) return;
        intentRef.current = "stop";
        clearTimers();
        setPlaybackStatus("paused");
      },
      onWaiting: onStall,
      onStalled: onStall,
      onError: (event: React.SyntheticEvent<HTMLAudioElement>) => {
        // Detaching the source on teardown can fire `error`; ignore when no src is set.
        if (!event.currentTarget.getAttribute("src")) return;
        handleFailure(false);
      },
      onEnded: () => {
        // A live stream only ends when the server closes it.
        if (intentRef.current === "play") scheduleRetry();
        else setPlaybackStatus("idle");
      },
    };

    const onOnline = () => {
      if (
        intentRef.current !== "play" ||
        statusRef.current !== "reconnecting"
      ) {
        return;
      }
      retryAttemptRef.current = 0;
      void connect();
    };

    const onOffline = () => {
      if (intentRef.current !== "play") return;
      clearTimers();
      setPlaybackStatus("reconnecting");
    };

    return { play, pause, toggle, audioHandlers, onOnline, onOffline };
  }, [stream.url, t]);

  useEffect(() => {
    window.addEventListener("online", engine.onOnline);
    window.addEventListener("offline", engine.onOffline);
    return () => {
      window.removeEventListener("online", engine.onOnline);
      window.removeEventListener("offline", engine.onOffline);
    };
  }, [engine]);

  useEffect(() => {
    const el = audioRef.current;
    const retryTimer = retryTimerRef;
    const watchdogTimer = watchdogTimerRef;
    return () => {
      // A detached <audio> keeps playing; release the stream on unmount.
      intentRef.current = "stop";
      clearTimeout(retryTimer.current);
      clearTimeout(watchdogTimer.current);
      if (el) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
    };
  }, []);

  const fallbackTitle = `${brand.prefix}${brand.accent}`.trim();

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: now?.title || fallbackTitle,
      artist: now?.title ? fallbackTitle : "",
      artwork: [{ src: now?.artworkUrl ?? "/apple-icon.png" }],
    });
  }, [now, fallbackTitle]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const actions: [MediaSessionAction, () => void][] = [
      ["play", engine.play],
      ["pause", engine.pause],
      ["stop", engine.pause],
    ];
    for (const [action, handler] of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Safari throws for unsupported actions.
      }
    }
    return () => {
      for (const [action] of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Unsupported action; nothing was registered.
        }
      }
    };
  }, [engine]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing" ? "playing" : status === "idle" ? "none" : "paused";
  }, [status]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const changeVolume = useCallback((v: number) => {
    setMuted(v === 0);
    setVolume(v);
    volumeRef.current = v;
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

  const value: LivePlayerContextValue = {
    isPlaying: status === "playing",
    isLoading: status === "connecting" || status === "reconnecting",
    isActive:
      status === "connecting" ||
      status === "playing" ||
      status === "reconnecting",
    isReconnecting: status === "reconnecting",
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
    toggle: engine.toggle,
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
        {...engine.audioHandlers}
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
