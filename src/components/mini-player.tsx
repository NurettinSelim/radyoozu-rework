"use client";

import Image from "next/image";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useLivePlayer } from "@/components/live-player-provider";
import { trackEvent } from "@/components/analytics/track";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const pathname = usePathname();
  const t = useTranslations("Player");
  const {
    isPlaying,
    isLoading,
    muted,
    volume,
    now,
    fallbackTitle,
    toggle,
    toggleMuted,
  } = useLivePlayer();

  // The home page already shows the full hero player.
  if (pathname === "/") return null;

  const isOnline = now?.status === "onair";
  const showMuteIcon = muted || volume === 0;

  return (
    <>
      {/* Spacer so page content / footer clears the fixed bar. */}
      <div aria-hidden className="h-[4.75rem]" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/80 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(120% 140% at 0% 100%, rgba(187,32,93,0.16) 0%, transparent 55%)",
          }}
        />
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
          <div className="size-11 shrink-0 overflow-hidden rounded-md bg-white/5">
            {now?.artworkUrl ? (
              <Image
                src={now.artworkUrl}
                alt=""
                width={88}
                height={88}
                unoptimized
                className="h-full w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
              />
            ) : (
              <Image
                src="/radyoozu-logo.png"
                alt=""
                width={88}
                height={88}
                className="h-full w-full rounded-md object-contain opacity-90 outline outline-1 -outline-offset-1 outline-white/10"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex h-1.5 w-1.5 rounded-full",
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
              <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/60">
                {isPlaying
                  ? t("nowPlaying")
                  : isLoading
                    ? t("connecting")
                    : isOnline
                      ? t("live")
                      : t("offair")}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-medium leading-tight">
              {now?.title || fallbackTitle}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMuted}
            aria-label={muted ? t("unmute") : t("mute")}
            className="hidden shrink-0 text-foreground/70 hover:text-foreground sm:inline-flex"
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

          <Button
            onClick={() => {
              if (!isPlaying) trackEvent("radio_play", { source: "mini" });
              toggle();
            }}
            disabled={isLoading}
            size="icon-lg"
            className="size-11 shrink-0 rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] text-white"
            aria-label={isPlaying ? t("pause") : t("play")}
          >
            <span className="relative flex size-5 items-center justify-center">
              <Pause
                className={cn(
                  "size-5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  isPlaying
                    ? "scale-100 opacity-100 blur-0"
                    : "scale-[0.25] opacity-0 blur-[4px]",
                )}
              />
              <Play
                className={cn(
                  "absolute size-5 translate-x-0.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  isPlaying
                    ? "scale-[0.25] opacity-0 blur-[4px]"
                    : "scale-100 opacity-100 blur-0",
                )}
              />
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
