import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstagramIcon, SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

const INSTAGRAM_HANDLE = "radyozu";

export const metadata: Metadata = {
  title: "Bize Ulaş",
  description:
    "Şarkı önerisi, geri bildirim veya iş birliği için Radyo Özü'ne yaz.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div>
          <p className="enter-rise text-xs uppercase tracking-widest text-primary">
            İletişim
          </p>
          <h1 className="enter-rise enter-delay-1 mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
            Önerilerini Bizimle Paylaş!
          </h1>
          <p className="enter-rise enter-delay-2 mt-4 max-w-xl text-base text-pretty text-foreground/70 sm:text-lg">
            Dinleyicilerimizden gelen her öneri, her şarkı isteği ve her yorum
            yayına dokunuyor. Bize yaz, stüdyoda konuşalım.
          </p>

          <dl className="enter-rise enter-delay-3 mt-10 space-y-6">
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                <Phone className="size-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/50">
                  Telefon
                </dt>
                <dd className="mt-1">
                  <Link
                    href={site.phoneHref}
                    className="text-lg tabular-nums transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
                  >
                    {site.phone}
                  </Link>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                <MapPin className="size-4" />
              </span>
              <div>
                <dt className="text-xs uppercase tracking-widest text-foreground/50">
                  Stüdyo
                </dt>
                <dd className="mt-1 max-w-sm text-foreground/80">
                  {site.address}
                </dd>
              </div>
            </div>
          </dl>

          <div className="enter-rise enter-delay-4 mt-10">
            <p className="mb-3 text-xs uppercase tracking-widest text-foreground/50">
              Sosyal
            </p>
            <SocialLinks />
          </div>
        </div>

        <div className="enter-rise enter-delay-3 flex flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-[#bb205d] to-[#94205a] text-white shadow-lg shadow-[#bb205d]/20">
            <InstagramIcon className="size-7" />
          </span>
          <h2 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Bize Instagram&apos;dan ulaş
          </h2>
          <p className="mt-3 text-pretty text-foreground/70">
            Önerilerini, şarkı isteklerini ve geri bildirimlerini DM olarak
            gönder!
          </p>
          <Button
            size="lg"
            className="mt-8 self-start rounded-full bg-linear-to-br from-[#bb205d] to-[#94205a] px-6 text-white"
            render={
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="size-4" />@{INSTAGRAM_HANDLE}
              </a>
            }
          />
        </div>
      </div>
    </div>
  );
}
