import type { Copy, Program, ScheduleWindow, Site } from "./schema";

export const DEFAULT_PROGRAMS: Program[] = [
  {
    slug: "b-side",
    title: "B-Side",
    tagline: "Benzersiz bir müzik sohbeti.",
    description:
      "Pazartesi akşamlarını müziğin arka yüzüne çeviren yayın. Plakların B yüzleri, unutulmuş parçalar ve keşifler Arda Birkal'ın moderatörlüğünde.",
    day: "Pazartesi",
    startHour: 19,
    endHour: 20,
    hosts: ["Arda Birkal"],
    accentFrom: "#bb205d",
    accentTo: "#f4eaca",
  },
  {
    slug: "pazartesi-sendromu-old-school",
    title: "Pazartesi Sendromu Old School",
    tagline: "Yılların eskitemediği efsane.",
    description:
      "Doyamadığınız sohbetlerle pazartesi sendromunu dağıtan kadrolu yayın. Eski okul tadında, samimi ve uzun.",
    day: "Pazartesi",
    startHour: 20,
    endHour: 22,
    hosts: ["Uğurcan Ayık", "Altuğ Karataş", "Bilge Kaan Tekin", "Mehmet Ali Bahur"],
    accentFrom: "#bb205d",
    accentTo: "#94205a",
  },
  {
    slug: "hayali-arkadas",
    title: "Hayali Arkadaş",
    tagline: "Yeni en yakın arkadaşınla tanış.",
    description:
      "Başınızdan geçenleri bir bir anlatacağınız, gerçek yaşam hikayelerinin kapılarını aralayan bir evren. Salı akşamlarının taze sohbeti.",
    day: "Salı",
    startHour: 18,
    endHour: 19,
    hosts: ["Ayselif Kaya", "Betül Bozkurt"],
    accentFrom: "#462155",
    accentTo: "#6d2158",
  },
  {
    slug: "romantik-komedi",
    title: "Romantik Komedi",
    tagline: "Salı akşamlarının vazgeçilmezi.",
    description:
      "Salı akşamlarına gümbür gümbür giren Romantik Komedi, ikinci sezonunda “Yeni Baştan” adıyla sürüyor.",
    day: "Salı",
    startHour: 19,
    endHour: 20,
    hosts: ["Elif Dicle Yılmaz", "Sera Letisya Ustabaşı"],
    accentFrom: "#94205a",
    accentTo: "#bb205d",
  },
  {
    slug: "jacket-radio",
    title: "Jacket Radio",
    tagline: "Oyun tutkunlarını bir araya getiren eşsiz konsept.",
    description:
      "Her çarşamba oyun dünyasından haberler, incelemeler ve tartışmalar. Kontrolcüyü eline al, yayın başlıyor.",
    day: "Çarşamba",
    startHour: 19,
    endHour: 20,
    hosts: ["Ali Naci Feyzioğlu"],
    accentFrom: "#1f2152",
    accentTo: "#462155",
  },
  {
    slug: "neler-oluyor-hayatta",
    title: "Neler Oluyor Hayatta",
    tagline: "Bağımlısı olduğunuz sohbet.",
    description:
      "Gündemden popüler kültüre, kampüs hayatından absürt fikirlere uzanan uzun soluklu çarşamba sohbeti.",
    day: "Çarşamba",
    startHour: 20,
    endHour: 22,
    hosts: ["Simo Açar", "Toprak Avcı", "Ege Dönmez"],
    accentFrom: "#f4eaca",
    accentTo: "#bb205d",
  },
  {
    slug: "developer-log",
    title: "Developer Log",
    tagline: "Teknoloji tutkunlarını bir araya getiren en yeni yayın.",
    description:
      "Yazılım, donanım, yapay zekâ ve kampüsteki teknik projeler üzerine haftalık notlar. Radyo ÖzÜ'nün taze sesi.",
    day: "Perşembe",
    startHour: 19,
    endHour: 20,
    hosts: ["Selim Özyılmaz"],
    accentFrom: "#6d2158",
    accentTo: "#94205a",
  },
  {
    slug: "yan-komsu",
    title: "Yan Komşu",
    tagline: "Yeni perşembe bağımlılığınız.",
    description:
      "Her hafta sürpriz bir konu, samimi bir moderasyon. Duvara kulak ver, yan komşu başladı.",
    day: "Perşembe",
    startHour: 20,
    endHour: 21,
    hosts: ["Lâl Aker"],
    accentFrom: "#f4eaca",
    accentTo: "#94205a",
  },
];

export const DEFAULT_SITE: Site = {
  name: "Radyo Özü",
  shortName: "RadyoÖzü",
  description:
    "Özyeğin Üniversitesi öğrenci radyosu. Canlı yayın, haftalık programlar ve müzik.",
  brand: { prefix: "Radyo ", accent: "Özü" },
  phone: "+90 216 564 97 97",
  phoneHref: "tel:+902165649797",
  address: "Özyeğin Üniversitesi Kampüsü, Öğrenci Merkezi Giriş Katı",
  email: "radyoozu@ozu.edu.tr",
  foundedYear: 2021,
  instagramHandle: "radyozu",
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
};

export const DEFAULT_SCHEDULE_WINDOW: ScheduleWindow = {
  startHour: 18,
  endHour: 22,
  days: [
    { key: "Pazartesi", label: "Pazartesi", short: "Pzt" },
    { key: "Salı", label: "Salı", short: "Sal" },
    { key: "Çarşamba", label: "Çarşamba", short: "Çar" },
    { key: "Perşembe", label: "Perşembe", short: "Per" },
  ],
};

export const DEFAULT_COPY: Copy = {
  home: {
    eyebrow: "Özyeğin Üniversitesi · Öğrenci Radyosu",
    tagline:
      "Ders aralarına, kütüphanede geçen gecelere, kampüste yürürken açık kalsın diye. Kampüsün sesi, öğrencilerin çalma listesi.",
    ctaPrograms: "Haftalık Yayınlar",
    ctaSpotify: "Spotify’da dinle",
    phoneLabel: "Stüdyo hattı",
    info: {
      studioEyebrow: "Stüdyo",
      studioHeading: "Öğrenci Merkezi",
      contactEyebrow: "Bize Ulaş",
    },
  },
  yayinlar: {
    eyebrow: "2025 – 26 Sezonu",
    headline: "Haftalık Program Akışı",
    tagline:
      "Haftanın her akşamı stüdyoda farklı bir ses. Canlı dinlemek için Canlı Yayın sayfamıza göz at — aşağıda kaçırılmayacak saatler.",
    metadataTitle: "Haftalık Yayınlar",
    metadataDescription:
      "Radyo Özü'nün 2025-26 sezonu haftalık yayın akışı.",
    liveLegend: "Şu an canlı",
    replayLegend: "Haftalık tekrar",
  },
  iletisim: {
    eyebrow: "İletişim",
    headline: "Önerilerini Bizimle Paylaş!",
    tagline:
      "Dinleyicilerimizden gelen her öneri, her şarkı isteği ve her yorum yayına dokunuyor. Bize yaz, stüdyoda konuşalım.",
    phoneLabel: "Telefon",
    emailLabel: "E-posta",
    studioLabel: "Stüdyo",
    socialLabel: "Sosyal",
    instagram: {
      heading: "Bize Instagram'dan ulaş",
      tagline:
        "Önerilerini, şarkı isteklerini ve geri bildirimlerini DM olarak gönder!",
    },
    metadataTitle: "Bize Ulaş",
    metadataDescription:
      "Şarkı önerisi, geri bildirim veya iş birliği için Radyo Özü'ne yaz.",
  },
  spotify: {
    eyebrow: "Çalma listeleri",
    headline: "Spotify’da Radyo Özü",
    tagline:
      "Yayında çaldığımız parçaları, program çalma listelerini ve en yeni keşiflerimizi Spotify profilimizden takip edebilirsin.",
    playlistsHeading: "Çalma listelerimiz",
    playlistsTagline:
      "Spotify profilimizdeki en yeni listeler — birine dokun, dinlemeye başla.",
    cardEyebrow: "Radyo Özü · Spotify",
    cardHeading: "Çalma listelerini keşfet",
    cardTagline: "Her programın kendi listesi, haftalık güncellenen karışımlar.",
    cardCta: "Spotify’da aç",
    tip: "İpucu: Spotify uygulamasında “Radyo Özü”yü takip edersen, yeni listeler ana sayfana düşer.",
    metadataTitle: "Spotify",
    metadataDescription: "Radyo Özü'nün Spotify çalma listeleri ve profili.",
  },
};
