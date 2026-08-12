import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { SocialLinks } from "@/components/social-links";
import { getSite } from "@/lib/site";

export async function SiteFooter() {
  const [site, t] = await Promise.all([getSite(), getTranslations("Footer")]);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-white/5 bg-background/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-4 py-10 md:flex-row md:items-center md:px-6">
        <div className="space-y-2">
          <p className="text-base font-medium">
            {site.brand.prefix}
            <span className="text-primary">{site.brand.accent}</span>
          </p>
          <p className="max-w-sm text-sm text-foreground/60">{site.address}</p>
          <p className="text-sm text-foreground/60">
            <Link
              href={site.phoneHref}
              className="tabular-nums transition-[color,scale] duration-150 ease-out hover:text-primary active:scale-[0.96]"
            >
              {site.phone}
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <SocialLinks />
          <p className="text-xs text-foreground/50">
            {t("rights", { year: String(year), name: site.shortName })}
          </p>
        </div>
      </div>
    </footer>
  );
}
