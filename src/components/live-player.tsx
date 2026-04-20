"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type NowPlaying = {
  status: "online" | "offline" | string;
  title: string;
  artworkUrl?: string;
};

async function fetchNowPlaying(): Promise<NowPlaying | null> {
  try {
    const [statusRes, trackRes] = await Promise.all([
      fetch(`${site.stream.apiBase}/status`, { cache: "no-store" }),
      fetch(`${site.stream.apiBase}/track/current`, { cache: "no-store" }),
    ]);
    const statusJson = (await statusRes.json()) as {
      status?: string;
      current_track?: { title?: string; artwork_url?: string };
    };
    const trackJson = (await trackRes.json()) as {
      data?: { title?: string; artwork_url?: string };
    };
    const title =
      trackJson.data?.title ?? statusJson.current_track?.title ?? "Canlı Yayın";
    const artworkUrl =
      trackJson.data?.artwork_url ?? statusJson.current_track?.artwork_url;
    return {
      status: statusJson.status ?? "offline",
      title,
      artworkUrl,
    };
  } catch {
    return null;
  }
}

export function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [now, setNow] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchNowPlaying();
      if (active) setNow(data);
    };
    load();
    const id = setInterval(load, 20_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    setError(null);
    if (isPlaying) {
      el.pause();
      el.src = "";
      setIsPlaying(false);
      return;
    }
    try {
      setIsLoading(true);
      el.src = `${site.stream.url}?_=${Date.now()}`;
      await el.play();
      setIsPlaying(true);
    } catch {
      setError("Yayın şu an başlatılamadı. Lütfen tekrar deneyin.");
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying]);

  const isOnline = now?.status === "online";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, rgba(251,191,36,0.18) 0%, transparent 55%), radial-gradient(120% 100% at 100% 100%, rgba(244,114,182,0.14) 0%, transparent 55%)",
        }}
      />

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative shrink-0">
          <div className="size-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:size-24">
            {now?.artworkUrl ? (
              <Image
                src={now.artworkUrl}
                alt=""
                width={200}
                height={200}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={site.stream.logo}
                alt=""
                width={200}
                height={200}
                unoptimized
                className="h-full w-full object-cover opacity-90"
              />
            )}
          </div>
          {isPlaying && (
            <div
              aria-hidden
              className="absolute -inset-1 -z-10 animate-pulse rounded-2xl bg-amber-400/30 blur-xl"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-2 w-2 rounded-full",
                isOnline ? "bg-emerald-400" : "bg-amber-400",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-full w-full rounded-full",
                  isOnline && "animate-ping bg-emerald-400/60",
                )}
              />
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-foreground/60">
              {isOnline ? "Canlı" : "Yayın"}
            </span>
          </div>
          <h2 className="mt-1 truncate text-lg font-semibold sm:text-xl">
            {now?.title ?? "Radyo Özü"}
          </h2>
          <p
            aria-live="polite"
            className="mt-0.5 truncate text-sm text-foreground/60"
          >
            {isPlaying
              ? "Şimdi dinliyorsun"
              : isLoading
                ? "Bağlanıyor…"
                : "Dinlemek için oynat"}
          </p>
        </div>

        <Button
          onClick={toggle}
          disabled={isLoading}
          size="icon-lg"
          className="size-14 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-background hover:opacity-90 [&>svg]:size-6 sm:size-16 sm:[&>svg]:size-7"
          aria-label={isPlaying ? "Duraklat" : "Oynat"}
        >
          {isPlaying ? <Pause /> : <Play className="translate-x-0.5" />}
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Sesi aç" : "Sesi kapat"}
          className="text-foreground/70 hover:text-foreground"
        >
          {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMuted(v === 0);
            setVolume(v);
          }}
          aria-label="Ses seviyesi"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-300 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-300"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-300/90">
          {error}
        </p>
      )}

      <audio
        ref={audioRef}
        preload="none"
        muted={muted}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setError("Yayın bağlantısı kesildi.");
          setIsPlaying(false);
        }}
      />
    </div>
  );
}
