import { SiteForm } from "@/app/admin/(authed)/site/_components/site-form";
import { getSite } from "@/lib/site";

export default async function AdminSitePage() {
  const site = await getSite("tr");
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Site Bilgileri
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Marka, iletişim bilgileri, canlı yayın URL&apos;leri ve sosyal medya
        hesaplarını buradan düzenle.
      </p>
      <div className="mt-8">
        <SiteForm initial={site} />
      </div>
    </div>
  );
}
