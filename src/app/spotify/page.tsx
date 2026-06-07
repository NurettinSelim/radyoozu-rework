import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ListMusic } from "lucide-react";

import { getCopy } from "@/content/copy";
import { getSite } from "@/lib/site";
import { getSpotifyPlaylists } from "@/lib/spotify";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return {
    title: copy.spotify.metadataTitle,
    description: copy.spotify.metadataDescription,
  };
}

export default async function SpotifyPage() {
  const [site, copy, playlists] = await Promise.all([
    getSite(),
    getCopy(),
    getSpotifyPlaylists(),
  ]);
  const c = copy.spotify;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header>
        <p className="enter-rise text-xs uppercase tracking-widest text-primary">
          {c.eyebrow}
        </p>
        <h1 className="enter-rise enter-delay-1 mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
          {c.headline}
        </h1>
        <p className="enter-rise enter-delay-2 mt-4 max-w-2xl text-base text-pretty text-foreground/70 sm:text-lg">
          {c.tagline}
        </p>
      </header>

      {playlists.length > 0 && (
        <section className="enter-rise enter-delay-3 mt-12">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {c.playlistsHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-pretty text-foreground/60">
            {c.playlistsTagline}
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-emerald-400/40 hover:bg-white/[0.04]"
                >
                  <div className="relative aspect-square overflow-hidden bg-emerald-500/10">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-emerald-300/50">
                        <ListMusic className="size-10" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 font-medium leading-snug">{p.name}</p>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-foreground/55">
                        {p.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs uppercase tracking-widest text-emerald-300/70">
                      {p.trackCount} parça
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={site.socials.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="enter-rise enter-delay-4 group mt-10 block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-transparent p-8 transition hover:border-emerald-400/40 sm:p-12"
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
                {c.cardEyebrow}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-balance sm:text-3xl">
                {c.cardHeading}
              </p>
              <p className="mt-1 max-w-md text-sm text-foreground/60">
                {c.cardTagline}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-background transition-[background-color,scale] duration-150 ease-out group-hover:bg-emerald-300 group-active:scale-[0.96]">
            {c.cardCta}
            <ExternalLink className="size-4" />
          </span>
        </div>
      </Link>

      <p className="enter-rise enter-delay-5 mt-6 text-sm text-foreground/50">
        {c.tip}
      </p>
    </div>
  );
}
