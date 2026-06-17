import { ArrowRight, Headphones, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { SpotifyIcon } from "@/components/social-links";
import { HomeInfoPanel } from "@/components/home-info-panel";
import { LivePlayer } from "@/components/live-player";
import { Link } from "@/i18n/navigation";
import { getCopy } from "@/content/copy";
import { getSite } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [site, copy, t] = await Promise.all([
    getSite(locale),
    getCopy(locale),
    getTranslations("Home"),
  ]);
  const c = copy.home;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,480px)] md:gap-14">
        <div>
          <span className="enter-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-foreground/70">
            <Headphones className="size-3.5" />
            {c.eyebrow}
          </span>
          <h1 className="enter-rise enter-delay-1 mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
            {site.brand.prefix}
            <span className="text-primary">{site.brand.accent}</span>
          </h1>
          <p className="enter-rise enter-delay-2 mt-6 max-w-xl text-base leading-relaxed text-pretty text-foreground/70 sm:text-lg">
            {c.tagline}
          </p>
          <div className="enter-rise enter-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] px-6 text-white"
              render={<Link href="/yayinlar" />}
            >
              {c.ctaPrograms}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="rounded-full border-white/15 bg-white/5 px-6"
              render={
                <a
                  href={site.socials.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <SpotifyIcon className="size-4" />
              {c.ctaSpotify}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="enter-rise enter-delay-3">
            <LivePlayer />
          </div>
          <a
            href={site.phoneHref}
            aria-label={t("callStudioAria", { phone: site.phone })}
            className="enter-rise enter-delay-4 group inline-flex items-center gap-2.5 self-center rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-sm transition-[background-color,border-color,color,scale] duration-200 ease-out hover:border-white/20 hover:bg-white/8 active:scale-[0.96]"
          >
            <Phone className="size-3.5 text-foreground/60 transition-colors group-hover:text-primary" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/60">
              {c.phoneLabel}
            </span>
            <span aria-hidden className="h-3 w-px bg-white/10" />
            <span className="font-medium tabular-nums text-foreground">
              {site.phone}
            </span>
          </a>
        </div>
      </section>

      <div className="enter-rise enter-delay-5">
        <HomeInfoPanel />
      </div>
    </div>
  );
}
