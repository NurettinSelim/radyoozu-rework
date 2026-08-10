import { Mail, Phone } from "lucide-react";

import { InstagramIcon } from "@/components/icons";
import { SpotifyIcon } from "@/components/social-links";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getSite } from "@/lib/site";
import { getCopy } from "@/content/copy";

function AddressLines({ address }: { address: string }) {
  const parts = address.split("·").map((p) => p.trim());
  return (
    <div className="mt-3 space-y-0.5 text-sm text-pretty text-foreground/60">
      {parts.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export async function HomeInfoPanel() {
  const [site, copy] = await Promise.all([getSite(), getCopy()]);
  const info = copy.home.info;
  return (
    <section className="mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-white/3 p-6 sm:p-8">
      <div className="relative grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="md:pr-10">
          <p className="text-xs uppercase tracking-widest text-foreground/50">
            {info.studioEyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-balance text-foreground sm:text-4xl">
            {info.studioHeading}
          </h2>
          <AddressLines address={site.address} />
        </div>

        <div
          aria-hidden
          className="hidden md:absolute md:left-1/2 md:top-0 md:block md:h-full md:w-px md:-translate-x-1/2 md:bg-linear-to-b md:from-transparent md:via-white/10 md:to-transparent"
        />

        <div className="border-t border-white/10 pt-8 md:border-t-0 md:pt-0 md:pl-10">
          <p className="text-xs uppercase tracking-widest text-foreground/50">
            {info.contactEyebrow}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <TrackedLink
                href={site.phoneHref}
                event="contact_click"
                params={{ method: "phone" }}
                className="inline-flex items-center gap-2 text-foreground/80 tabular-nums transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
              >
                <Phone className="size-3.5 opacity-70" />
                {site.phone}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={`mailto:${site.email}`}
                event="contact_click"
                params={{ method: "email" }}
                className="inline-flex items-center gap-2 text-foreground/80 transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
              >
                <Mail className="size-3.5 opacity-70" />
                {site.email}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={site.socials.instagram}
                event="contact_click"
                params={{ method: "instagram" }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/80 transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
              >
                <InstagramIcon className="size-3.5 opacity-70" />
                {site.instagramHandle}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={site.socials.spotify}
                event="outbound_click"
                params={{ target: "spotify" }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/80 transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
              >
                <SpotifyIcon className="size-3.5 opacity-70" />
                Spotify
              </TrackedLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
