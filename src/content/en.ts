// Static English translations of the editorial content. Turkish is the
// admin-editable source of truth (Vercel Blob); English is translated once
// here and merged onto the blob data by the locale-aware content loaders.
import type { Copy, DayKey } from "@/content/schema";

export const EN_COPY: Copy = {
  home: {
    eyebrow: "Özyeğin University · Student Radio",
    tagline:
      "For the breaks between classes, late nights in the library, and walks across campus. The sound of campus, the students' playlist.",
    ctaPrograms: "Weekly Schedule",
    ctaSpotify: "Listen on Spotify",
    phoneLabel: "Studio line",
    info: {
      studioEyebrow: "Studio",
      studioHeading: "Student Center",
      contactEyebrow: "Get in Touch",
    },
  },
  yayinlar: {
    eyebrow: "2025 – 26 Season",
    headline: "Weekly Program Schedule",
    tagline:
      "A different voice in the studio every evening of the week. Check our Live page to tune in — the can't-miss hours are below.",
    metadataTitle: "Weekly Schedule",
    metadataDescription:
      "Radyo ÖzÜ's weekly program schedule for the 2025-26 season.",
    liveLegend: "On air now",
    replayLegend: "Weekly replay",
  },
  iletisim: {
    eyebrow: "Contact",
    headline: "Share Your Ideas With Us!",
    tagline:
      "Every suggestion, song request, and comment from our listeners shapes the show. Write to us — let's talk in the studio.",
    phoneLabel: "Phone",
    phoneNote: "This line is only for joining the live broadcast. To reach us:",
    emailLabel: "Email",
    studioLabel: "Studio",
    socialLabel: "Social",
    instagram: {
      heading: "Reach us on Instagram",
      tagline:
        "Send your suggestions, song requests, and feedback as a DM!",
    },
    metadataTitle: "Contact",
    metadataDescription:
      "Write to Radyo ÖzÜ for song suggestions, feedback, or collaborations.",
  },
  spotify: {
    eyebrow: "Playlists",
    headline: "Radyo ÖzÜ on Spotify",
    tagline:
      "Follow the tracks we play on air, our show playlists, and our latest discoveries on our Spotify profile.",
    playlistsHeading: "Our playlists",
    playlistsTagline:
      "The newest lists on our Spotify profile — tap one and start listening.",
    cardEyebrow: "Radyo ÖzÜ · Spotify",
    cardHeading: "Explore the playlists",
    cardTagline: "A list for every show, with mixes updated weekly.",
    cardCta: "Open in Spotify",
    tip: "Tip: follow “Radyo ÖzÜ” in the Spotify app and new lists will show up on your home page.",
    metadataTitle: "Spotify",
    metadataDescription: "Radyo ÖzÜ's Spotify playlists and profile.",
  },
};

// Site fields that are language-dependent. Everything else (phone, email,
// stream, socials, brand) is locale-neutral and comes straight from the blob.
export const EN_SITE: {
  description: string;
  address: string;
  navLabels: Record<string, string>;
} = {
  description:
    "Özyeğin University's student radio. Live broadcast, weekly programs, and music.",
  address: "Özyeğin University Campus, Student Center Entrance Floor",
  navLabels: {
    "/": "Live",
    "/yayinlar": "Schedule",
    "/spotify": "Spotify",
    "/iletisim": "Contact",
  },
};

// Program titles and host names stay as original proper nouns; only the
// tagline + description are translated, matched by slug.
export const EN_PROGRAM_TRANSLATIONS: Record<
  string,
  { tagline: string; description: string }
> = {
  "b-side": {
    tagline: "A one-of-a-kind music conversation.",
    description:
      "A show that turns Monday evenings toward the flip side of music. B-sides, forgotten tracks, and discoveries, hosted by Arda Birkal.",
  },
  "pazartesi-sendromu-old-school": {
    tagline: "A legend the years can't wear down.",
    description:
      "A resident show that chases away the Monday blues with conversations you can't get enough of. Old-school in flavor, warm and long.",
  },
  "hayali-arkadas": {
    tagline: "Meet your new best friend.",
    description:
      "A universe that opens the doors to real-life stories, where you share everything that happens to you. Tuesday evening's fresh conversation.",
  },
  "romantik-komedi": {
    tagline: "A Tuesday-evening essential.",
    description:
      "Bursting into Tuesday evenings, Romantik Komedi continues into its second season under the name “Yeni Baştan.”",
  },
  "jacket-radio": {
    tagline: "A unique concept that brings gamers together.",
    description:
      "News, reviews, and debates from the gaming world every Wednesday. Grab your controller — the show is starting.",
  },
  "neler-oluyor-hayatta": {
    tagline: "The conversation you'll get hooked on.",
    description:
      "A long-form Wednesday conversation spanning current events, pop culture, campus life, and absurd ideas.",
  },
  "yedek-kulubesi": {
    tagline: "Campus sports talk, live from the bench.",
    description:
      "The week's matches from football to basketball, transfer gossip, and news from ÖzÜ teams. Warm-up's over — the subs are in.",
  },
  "developer-log": {
    tagline: "The newest show bringing tech enthusiasts together.",
    description:
      "Weekly notes on software, hardware, AI, and technical projects on campus. Radyo ÖzÜ's fresh voice.",
  },
  "yan-komsu": {
    tagline: "Your new Thursday habit.",
    description:
      "A surprise topic every week, with warm hosting. Put your ear to the wall — Yan Komşu has started.",
  },
};

export const EN_DAY_LABELS: Record<DayKey, { label: string; short: string }> = {
  Pazartesi: { label: "Monday", short: "Mon" },
  Salı: { label: "Tuesday", short: "Tue" },
  Çarşamba: { label: "Wednesday", short: "Wed" },
  Perşembe: { label: "Thursday", short: "Thu" },
  Cuma: { label: "Friday", short: "Fri" },
  Cumartesi: { label: "Saturday", short: "Sat" },
  Pazar: { label: "Sunday", short: "Sun" },
};
