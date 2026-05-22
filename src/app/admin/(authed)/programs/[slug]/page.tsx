import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProgramForm } from "@/app/admin/(authed)/programs/_components/program-form";
import { getPrograms } from "@/content/programs";

type Params = { slug: string };

export default async function EditProgramPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const programs = await getPrograms();
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  return (
    <div>
      <Link
        href="/admin/programs"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-foreground/55 transition-colors hover:text-foreground/80"
      >
        <ArrowLeft className="size-3.5" />
        Yayın listesi
      </Link>
      <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
        {program.title}
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        {program.day} · {String(program.startHour).padStart(2, "0")}:00 –{" "}
        {String(program.endHour).padStart(2, "0")}:00
      </p>

      <div className="mt-8">
        <ProgramForm mode="edit" initial={program} />
      </div>
    </div>
  );
}
