import { getPrograms } from "@/content/programs";
import { SITE_URL } from "@/lib/seo";
import { getSite, RADIO_FOUNDED_YEAR } from "@/lib/site";

export async function GET() {
  const [site, programs] = await Promise.all([
    getSite("tr"),
    getPrograms("tr"),
  ]);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} (${site.shortName}), Özyeğin Üniversitesi'nin (İstanbul, Türkiye) resmi öğrenci radyosudur. Kasım ${RADIO_FOUNDED_YEAR}'te kurulmuştur. İnternet üzerinden 7/24 canlı müzik yayını, haftalık öğrenci programları ve Spotify çalma listeleri sunar. Radyo ÖzÜ is the official student radio station of Özyeğin University, Istanbul — founded in November ${RADIO_FOUNDED_YEAR}, with a live stream, weekly student-run shows, and curated playlists.`,
    "",
    "Önemli bilgiler / Key facts:",
    `- Kuruluş / Founded: Kasım / November ${RADIO_FOUNDED_YEAR}`,
    "- Yayın / Broadcast: 7/24 canlı internet radyosu (Radio.co)",
    `- Stüdyo / Studio: ${site.address}`,
    `- İletişim / Contact: ${site.email} · ${site.phone}`,
    "- Üniversite / University: Özyeğin Üniversitesi — https://www.ozyegin.edu.tr",
    "",
    "## Sayfalar / Pages",
    `- [Canlı Yayın](${SITE_URL}/): Ana sayfa ve canlı radyo oynatıcısı`,
    `- [Haftalık Yayınlar](${SITE_URL}/yayinlar): Haftalık program akışı`,
    `- [Spotify](${SITE_URL}/spotify): Çalma listelerimiz`,
    `- [İletişim](${SITE_URL}/iletisim): Stüdyo, telefon ve sosyal medya`,
    `- [English](${SITE_URL}/en): English version of the site`,
    "",
    "## Programlar / Weekly shows",
    ...programs.map(
      (program) =>
        `- ${program.title} — ${program.hosts.join(", ")} (${program.day} ${program.startHour}:00–${program.endHour}:00): ${program.tagline}`,
    ),
    "",
    "## Sosyal medya / Social",
    `- Instagram: ${site.socials.instagram}`,
    `- YouTube: ${site.socials.youtube}`,
    `- X (Twitter): ${site.socials.twitter}`,
    `- Spotify: ${site.socials.spotify}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
