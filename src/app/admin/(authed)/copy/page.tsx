import { CopyForm } from "@/app/admin/(authed)/copy/_components/copy-form";
import { getCopy } from "@/content/copy";

export default async function AdminCopyPage() {
  const copy = await getCopy("tr");
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold tracking-tight">
        Metinler
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Ana sayfa, yayın akışı, iletişim ve Spotify sayfalarındaki başlıkları
        ve açıklamaları buradan düzenle.
      </p>
      <div className="mt-8">
        <CopyForm initial={copy} />
      </div>
    </div>
  );
}
