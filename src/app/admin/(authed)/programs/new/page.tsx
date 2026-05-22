import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProgramForm } from "@/app/admin/(authed)/programs/_components/program-form";

export default function NewProgramPage() {
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
        Yeni Yayın
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Tüm alanları doldur. Slug bir kez belirlenir ve URL kimliği olarak
        kullanılır.
      </p>

      <div className="mt-8">
        <ProgramForm mode="create" />
      </div>
    </div>
  );
}
