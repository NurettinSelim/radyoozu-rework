"use client";

import Image from "next/image";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useLivePlayer } from "@/components/live-player-provider";
import { trackEvent } from "@/components/analytics/track";
import { cn } from "@/lib/utils";

export function LivePlayer() {
  const t = useTranslations("Player");
  const {
    isPlaying,
    isLoading,
    error,
    muted,
    volume,
    now,
    fallbackTitle,
    toggle,
    toggleMuted,
    changeVolume,
  } = useLivePlayer();

  const isOnline = now?.status === "onair";
  const showMuteIcon = muted || volume === 0;

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, rgba(187,32,93,0.22) 0%, transparent 55%), radial-gradient(120% 100% at 100% 100%, rgba(70,33,85,0.35) 0%, transparent 55%)",
        }}
      />

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative shrink-0">
          <div className="size-20 overflow-hidden rounded-lg bg-white/5 sm:size-24">
            {now?.artworkUrl ? (
              <Image
                src={now.artworkUrl}
                alt=""
                width={200}
                height={200}
                unoptimized
                className="h-full w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-white/10"
              />
            ) : (
              <Image
                src="/radyoozu-logo.png"
                alt=""
                width={200}
                height={200}
                className="h-full w-full rounded-lg object-contain opacity-90 outline outline-1 -outline-offset-1 outline-white/10"
              />
            )}
          </div>
          {isPlaying ? (
            <div
              aria-hidden
              className="absolute -inset-1 -z-10 animate-pulse rounded-lg bg-primary/30 blur-xl"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-2 w-2 rounded-full",
                isOnline ? "bg-emerald-400" : "bg-[#f4eaca]",
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
              {isOnline ? t("live") : t("offair")}
            </span>
          </div>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-balance sm:text-xl">
            {now?.title || fallbackTitle}
          </h2>
          <p
            aria-live="polite"
            className="mt-0.5 truncate text-sm text-foreground/60"
          >
            {isPlaying
              ? t("nowPlaying")
              : isLoading
                ? t("connecting")
                : t("pressPlay")}
          </p>
        </div>

        <Button
          onClick={() => {
            if (!isPlaying) trackEvent("radio_play", { source: "hero" });
            toggle();
          }}
          disabled={isLoading}
          size="icon-lg"
          className="size-14 shrink-0 rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] text-white sm:size-16"
          aria-label={isPlaying ? t("pause") : t("play")}
        >
          <span className="relative flex size-6 items-center justify-center sm:size-7">
            <Pause
              className={cn(
                "size-6 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] sm:size-7",
                isPlaying
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
            <Play
              className={cn(
                "absolute size-6 translate-x-0.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] sm:size-7",
                isPlaying
                  ? "scale-[0.25] opacity-0 blur-[4px]"
                  : "scale-100 opacity-100 blur-0",
              )}
            />
          </span>
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-3 py-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMuted}
          aria-label={muted ? t("unmute") : t("mute")}
          className="relative text-foreground/70 hover:text-foreground after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
        >
          <span className="relative flex size-4 items-center justify-center">
            <Volume2
              className={cn(
                "size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                showMuteIcon
                  ? "scale-[0.25] opacity-0 blur-[4px]"
                  : "scale-100 opacity-100 blur-0",
              )}
            />
            <VolumeX
              className={cn(
                "absolute size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                showMuteIcon
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
          </span>
        </Button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label={t("volume")}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#bb205d] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#bb205d] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#bb205d]"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
