import { readContent } from "@/lib/content-store";
import { nextOccurrence } from "@/lib/next-broadcast";
import { SITE_URL } from "@/lib/seo";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function formatUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  const programs = await readContent("programs");
  const program = programs.find((item) => item.slug === slug);

  if (!program) {
    return Response.json({ error: "Program not found" }, { status: 404 });
  }

  const now = new Date();
  const occurrence = nextOccurrence([program], now);
  if (!occurrence) {
    return Response.json({ error: "Program not found" }, { status: 404 });
  }

  const end = new Date(
    occurrence.start.getTime() +
      (program.endHour - program.startHour) * 3_600_000,
  );
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Radyo OzU//radyoozu.com//TR",
    "BEGIN:VEVENT",
    `UID:${program.slug}@radyoozu.com`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(occurrence.start)}`,
    `DTEND:${formatUtc(end)}`,
    "RRULE:FREQ=WEEKLY",
    `SUMMARY:${escapeIcsText(program.title)}`,
    `DESCRIPTION:${escapeIcsText(`${program.tagline} — ${SITE_URL}`)}`,
    `URL:${SITE_URL}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(program.title)}`,
    "TRIGGER:-PT10M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="radyo-ozu-${program.slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
