export const site = {
  name: "Radyo Özü",
  shortName: "RadyoÖzü",
  description:
    "Özyeğin Üniversitesi öğrenci radyosu. Canlı yayın, haftalık programlar ve müzik.",
  phone: "+90 216 564 97 97",
  phoneHref: "tel:+902165649797",
  address: "Özyeğin Üniversitesi Kampüsü, Öğrenci Merkezi Giriş Katı",
  foundedYear: 2021,
  stream: {
    url: "https://s5.radio.co/s3ab6bdcb9/listen",
    stationId: "s3ab6bdcb9",
    apiBase: "https://public.radio.co/api/v2/s3ab6bdcb9",
    logo: "https://images.radio.co/station_logos/s3ab6bdcb9.20221010021650.png",
  },
  socials: {
    spotify:
      "https://open.spotify.com/user/21dw1vj0ziac5h7spi999w8i2?si=353e94766e584ffa",
    spotifyEmbed:
      "https://open.spotify.com/embed/user/21dw1vj0ziac5h7spi999w8i2",
    twitter: "https://twitter.com/RadyoOzU",
    instagram: "https://www.instagram.com/radyozu/",
    youtube: "https://www.youtube.com/c/RadyoOzU",
  },
  nav: [
    { href: "/", label: "Canlı Yayın" },
    { href: "/yayinlar", label: "Haftalık Yayınlar" },
    { href: "/spotify", label: "Spotify" },
    { href: "/iletisim", label: "Bize Ulaş!" },
  ],
} as const;

export type NavItem = (typeof site.nav)[number];
