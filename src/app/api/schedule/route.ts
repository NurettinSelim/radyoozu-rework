import { readContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

// Public read API. Besides the site's own player, the studio's OBS overlay
// dock reads it to list the shows, find the one on air and fill in each show's
// Instagram handle. Only add fields here; renaming or removing one breaks it.
export async function GET() {
  const programs = await readContent("programs");

  return Response.json(
    programs.map(({ slug, title, day, startHour, endHour, instagramHandle }) => ({
      slug,
      title,
      day,
      startHour,
      endHour,
      instagramHandle: instagramHandle ?? null,
    })),
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
