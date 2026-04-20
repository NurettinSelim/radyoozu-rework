import Link from "next/link";

import { SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-white/5 bg-background/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-4 py-10 md:flex-row md:items-center md:px-6">
        <div className="space-y-2">
          <p className="text-base font-medium">
            Radyo <span className="text-primary">Özü</span>
          </p>
          <p className="max-w-sm text-sm text-foreground/60">
            {site.address}
          </p>
          <p className="text-sm text-foreground/60">
            <Link
              href={site.phoneHref}
              className="hover:text-primary"
            >
              {site.phone}
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <SocialLinks />
          <p className="text-xs text-foreground/50">
            © {year} RadyoÖzü · Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
