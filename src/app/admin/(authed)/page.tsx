import Link from "next/link";
import { CalendarDays, Clock, FileText, Radio } from "lucide-react";

const CARDS = [
  {
    href: "/admin/programs",
    label: "Yayınlar",
    description:
      "Haftalık programları ekle, düzenle veya kaldır. Sunucu listesi ve renk paleti dahil.",
    icon: Radio,
  },
  {
    href: "/admin/site",
    label: "Site Bilgileri",
    description:
      "Telefon, adres, sosyal medya hesapları ve canlı yayın URL'leri.",
    icon: FileText,
  },
  {
    href: "/admin/schedule-window",
    label: "Program Saatleri",
    description:
      "Haftalık akışta gösterilen günler ve saat aralığı (örn. Pzt – Per, 18:00 – 22:00).",
    icon: Clock,
  },
  {
    href: "/admin/copy",
    label: "Metinler",
    description:
      "Ana sayfa, yayın akışı, iletişim ve Spotify sayfalarının başlık ve açıklamaları.",
    icon: CalendarDays,
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <p className="text-sm text-foreground/65">
        Düzenleme yapmak istediğin alanı seç. Kaydettiğin değişiklikler birkaç
        saniye içinde sitenin yayın sürümünde görünür.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-6 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {card.label}
              </h2>
              <p className="mt-2 text-sm text-foreground/65">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
