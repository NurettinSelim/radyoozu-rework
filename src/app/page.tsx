import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LivePlayer } from "@/components/live-player";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,480px)] md:gap-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-foreground/70">
            <Headphones className="size-3.5" />
            Özyeğin Üniversitesi · Öğrenci Radyosu
          </span>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Radyo <span className="text-primary">Özü</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Ders aralarına, kütüphanede geçen gecelere, kampüste yürürken açık
            kalsın diye. Kampüsün sesi, öğrencilerin çalma listesi.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
        <LivePlayer />
      </section>

      <section className="mt-24 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-3 sm:p-8">
        <Stat label="Stüdyo" value="Öğrenci Merkezi" />
        <Stat label="İletişim" value={site.phone} href={site.phoneHref} />
        <Stat label="Yayından beri" value={`${site.foundedYear}`} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-widest text-foreground/50">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
        {value}
      </p>
    </>
  );
  return (
    <div className="rounded-2xl bg-background/30 p-5">
      {href ? (
        <Link href={href} className="block hover:text-primary">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}
