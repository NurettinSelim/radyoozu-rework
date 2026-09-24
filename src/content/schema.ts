import { z } from "zod";

export const DAY_KEYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;
export type DayKey = (typeof DAY_KEYS)[number];

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Geçerli bir hex renk girin (örn. #bb205d)");

export const programSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
    title: z.string().min(1, "Başlık zorunlu"),
    tagline: z.string().min(1, "Tagline zorunlu"),
    description: z.string().min(1, "Açıklama zorunlu"),
    day: z.enum(DAY_KEYS),
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
    hosts: z.array(z.string().min(1)).min(1, "En az bir sunucu ekleyin"),
    instagramHandle: z
      .string()
      .regex(/^[a-zA-Z0-9._]+$/, "Sadece harf, rakam, nokta ve alt çizgi")
      .optional(),
    accentFrom: hexColor,
    accentTo: hexColor,
  })
  .refine((p) => p.endHour > p.startHour, {
    message: "Bitiş saati başlangıçtan sonra olmalı",
    path: ["endHour"],
  });

export const programsSchema = z.array(programSchema);
export type Program = z.infer<typeof programSchema>;

export const dayConfigSchema = z.object({
  key: z.enum(DAY_KEYS),
  label: z.string().min(1),
  short: z.string().min(1).max(8),
});
export type DayConfig = z.infer<typeof dayConfigSchema>;

export const scheduleWindowSchema = z
  .object({
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
    days: z.array(dayConfigSchema).min(1),
  })
  .refine((w) => w.endHour > w.startHour, {
    message: "Bitiş saati başlangıçtan sonra olmalı",
    path: ["endHour"],
  });
export type ScheduleWindow = z.infer<typeof scheduleWindowSchema>;

export const navItemSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const siteSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  description: z.string().min(1),
  brand: z.object({
    prefix: z.string(),
    accent: z.string().min(1),
  }),
  phone: z.string().min(1),
  phoneHref: z.string().regex(/^tel:/, "tel: ile başlamalı"),
  address: z.string().min(1),
  email: z.email("Geçerli bir e-posta girin").default("radyoozu@ozu.edu.tr"),
  instagramHandle: z.string().min(1),
  stream: z.object({
    url: z.url(),
    stationId: z.string().min(1),
    apiBase: z.url(),
    logo: z.url(),
  }),
  socials: z.object({
    spotify: z.url(),
    twitter: z.url(),
    instagram: z.url(),
    youtube: z.url(),
  }),
  nav: z.array(navItemSchema).min(1),
});
export type Site = z.infer<typeof siteSchema>;

export const copySchema = z.object({
  home: z.object({
    eyebrow: z.string().min(1),
    tagline: z.string().min(1),
    ctaPrograms: z.string().min(1),
    ctaSpotify: z.string().min(1),
    phoneLabel: z.string().min(1),
    info: z.object({
      studioEyebrow: z.string().min(1),
      studioHeading: z.string().min(1),
      contactEyebrow: z.string().min(1),
    }),
  }),
  yayinlar: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    tagline: z.string().min(1),
    metadataTitle: z.string().min(1),
    metadataDescription: z.string().min(1),
    liveLegend: z.string().min(1),
    replayLegend: z.string().min(1),
  }),
  iletisim: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    tagline: z.string().min(1),
    phoneLabel: z.string().min(1),
    phoneNote: z.string().min(1).default("Bu hat yalnızca canlı yayına katılmak içindir. Bize ulaşmak için:"),
    emailLabel: z.string().min(1).default("E-posta"),
    studioLabel: z.string().min(1),
    socialLabel: z.string().min(1),
    instagram: z.object({
      heading: z.string().min(1),
      tagline: z.string().min(1),
    }),
    metadataTitle: z.string().min(1),
    metadataDescription: z.string().min(1),
  }),
  spotify: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    tagline: z.string().min(1),
    playlistsHeading: z.string().min(1).default("Çalma listelerimiz"),
    playlistsTagline: z
      .string()
      .min(1)
      .default("Spotify profilimizdeki en yeni listeler — birine dokun, dinlemeye başla."),
    cardEyebrow: z.string().min(1),
    cardHeading: z.string().min(1),
    cardTagline: z.string().min(1),
    cardCta: z.string().min(1),
    tip: z.string().min(1),
    metadataTitle: z.string().min(1),
    metadataDescription: z.string().min(1),
  }),
});
export type Copy = z.infer<typeof copySchema>;

export const CONTENT_KEYS = {
  programs: "programs",
  site: "site",
  scheduleWindow: "scheduleWindow",
  copy: "copy",
} as const;
export type ContentKey = (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];

export const BLOB_PATHS: Record<ContentKey, string> = {
  programs: "content/programs.json",
  site: "content/site.json",
  scheduleWindow: "content/schedule-window.json",
  copy: "content/copy.json",
};
