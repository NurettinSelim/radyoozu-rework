import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { getSite } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const [site, t] = await Promise.all([
    getSite(locale as Locale),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  const title = `${site.name} · ${t("siteSuffix")}`;
  return {
    title: { default: title, template: `%s · ${site.name}` },
    description: site.description,
    openGraph: {
      title,
      description: site.description,
      type: "website",
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const site = await getSite(locale);
  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-background font-sans text-foreground">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(60% 40% at 15% 0%, rgba(187,32,93,0.14) 0%, transparent 60%), radial-gradient(50% 40% at 100% 100%, rgba(70,33,85,0.22) 0%, transparent 55%)",
          }}
        />
        <NextIntlClientProvider>
          <SiteHeader nav={site.nav} brand={site.brand} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
