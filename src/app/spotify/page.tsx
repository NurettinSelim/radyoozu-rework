import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spotify",
  description: "Radyo Özü'nün Spotify çalma listeleri ve profili.",
};

export default function SpotifyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header>
        <p className="enter-rise text-xs uppercase tracking-widest text-primary">
          Çalma listeleri
        </p>
        <h1 className="enter-rise enter-delay-1 mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
          Spotify’da Radyo Özü
        </h1>
        <p className="enter-rise enter-delay-2 mt-4 max-w-2xl text-base text-pretty text-foreground/70 sm:text-lg">
          Yayında çaldığımız parçaları, program çalma listelerini ve en yeni
          keşiflerimizi Spotify profilimizden takip edebilirsin.
        </p>
      </header>

      <Link
        href={site.socials.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="enter-rise enter-delay-3 group mt-10 block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-transparent p-8 transition hover:border-emerald-400/40 sm:p-12"
      >
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden>
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-300/80">
                Radyo Özü · Spotify
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-balance sm:text-3xl">
                Çalma listelerini keşfet
              </p>
              <p className="mt-1 max-w-md text-sm text-foreground/60">
                Her programın kendi listesi, haftalık güncellenen karışımlar.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-background transition-[background-color,scale] duration-150 ease-out group-hover:bg-emerald-300 group-active:scale-[0.96]">
            Spotify’da aç
            <ExternalLink className="size-4" />
          </span>
        </div>
      </Link>

      <p className="enter-rise enter-delay-4 mt-6 text-sm text-foreground/50">
        İpucu: Spotify uygulamasında “Radyo Özü”yü takip edersen, yeni listeler
        ana sayfana düşer.
      </p>
    </div>
  );
}
