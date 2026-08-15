import type { Locale } from "@/i18n/routing";
import { localePath, SITE_URL } from "@/lib/seo";
import { RADIO_FOUNDING_DATE, type Site } from "@/lib/site";

type Props = {
  site: Site;
  locale: Locale;
};

export function StructuredData({ site, locale }: Props) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RadioStation",
        "@id": `${SITE_URL}/#station`,
        name: site.name,
        alternateName: [
          site.shortName,
          "Radyo Özyeğin",
          "Özyeğin Üniversitesi Radyosu",
        ],
        url: SITE_URL,
        logo: `${SITE_URL}/radyoozu-logo.png`,
        image: site.stream.logo,
        description: site.description,
        email: site.email,
        telephone: site.phone,
        foundingDate: RADIO_FOUNDING_DATE,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address,
          addressLocality: "İstanbul",
          addressCountry: "TR",
        },
        parentOrganization: {
          "@type": "CollegeOrUniversity",
          name: "Özyeğin Üniversitesi",
          url: "https://www.ozyegin.edu.tr",
        },
        sameAs: [
          site.socials.instagram,
          site.socials.youtube,
          site.socials.twitter,
          site.socials.spotify,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: site.name,
        url: `${SITE_URL}${localePath(locale, "/")}`,
        inLanguage: locale === "en" ? "en" : "tr",
        publisher: { "@id": `${SITE_URL}/#station` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
