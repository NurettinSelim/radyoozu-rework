import { readContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const programs = await readContent("programs");

  return Response.json(
    programs.map(({ slug, title, day, startHour }) => ({
      slug,
      title,
      day,
      startHour,
    })),
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
