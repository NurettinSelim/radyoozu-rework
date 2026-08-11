import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, FileText, LayoutGrid, Music, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutGrid },
  { href: "/admin/programs", label: "Yayınlar", icon: Radio },
  { href: "/admin/site", label: "Site Bilgileri", icon: FileText },
  { href: "/admin/schedule-window", label: "Program Saatleri", icon: Clock },
  { href: "/admin/copy", label: "Metinler", icon: CalendarDays },
  { href: "/admin/spotify", label: "Spotify", icon: Music },
];

export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">
            Radyo ÖzÜ · Yönetim
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Yönetim Paneli
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <span className="hidden tabular-nums sm:inline">
            {session.user.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-full border-white/15 bg-white/5"
            >
              Çıkış
            </Button>
          </form>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
        <aside className="md:sticky md:top-24 md:self-start">
          <nav aria-label="Yönetim menüsü">
            <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-foreground/70 transition-[background-color,color] duration-150 ease-out hover:bg-white/5 hover:text-foreground"
                    >
                      <Icon className="size-4 opacity-70" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
