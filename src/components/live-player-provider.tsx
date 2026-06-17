"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

export type NowPlaying = {
  status: "onair" | "offline" | string;
  title: string;
  artworkUrl?: string;
};

const INITIAL_VOLUME = 1.0;
const POLL_INTERVAL_MS = 20_000;

type Brand = { prefix: string; accent: string };

type Stream = { url: string; apiBase: string };

type LivePlayerContextValue = {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  muted: boolean;
  volume: number;
  now: NowPlaying | null;
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
  children: React.ReactNode;
};

export function LivePlayerProvider({ stream, brand, children }: Props) {
  const t = useTranslations("Player");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(INITIAL_VOLUME);
  const [now, setNow] = useState<NowPlaying | null>(null);

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

  const fallbackTitle = `${brand.prefix}${brand.accent}`.trim();

  const value: LivePlayerContextValue = {
    isPlaying,
    isLoading,
    error,
    muted,
    volume,
    now,
    brand,
    fallbackTitle,
    toggle,
    toggleMuted,
    changeVolume,
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
