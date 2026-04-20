import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HomeInfoPanel } from "@/components/home-info-panel";
import { LivePlayer } from "@/components/live-player";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,480px)] md:gap-14">
        <div>
          <span className="enter-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-foreground/70">
            <Headphones className="size-3.5" />
            Özyeğin Üniversitesi · Öğrenci Radyosu
          </span>
          <h1 className="enter-rise enter-delay-1 mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
            Radyo <span className="text-primary">Özü</span>
          </h1>
          <p className="enter-rise enter-delay-2 mt-6 max-w-xl text-base leading-relaxed text-pretty text-foreground/70 sm:text-lg">
            Ders aralarına, kütüphanede geçen gecelere, kampüste yürürken açık
            kalsın diye. Kampüsün sesi, öğrencilerin çalma listesi.
          </p>
          <div className="enter-rise enter-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] px-6 text-white"
              render={<Link href="/yayinlar" />}
            >
              Haftalık Yayınlar
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="rounded-full border-white/15 bg-white/5 px-6"
              render={
                <Link
                  href={site.socials.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Spotify’da dinle
            </Button>
          </div>
        </div>
        <div className="enter-rise enter-delay-3">
          <LivePlayer />
        </div>
      </section>

      <div className="enter-rise enter-delay-4">
        <HomeInfoPanel />
      </div>
    </div>
  );
}
