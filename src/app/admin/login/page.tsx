import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.isAdmin) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16 md:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/4 p-8 shadow-2xl shadow-black/30">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Yönetici Girişi
        </h1>
        <p className="mt-3 text-sm text-foreground/65">
          Radyo Özü içeriklerini düzenlemek için ortak{" "}
          <span className="font-medium text-foreground">
            radyoozu@ozu.edu.tr
          </span>{" "}
          hesabıyla giriş yap.
        </p>
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center gap-3 rounded-full bg-white text-neutral-900 hover:bg-white/90"
          >
            <GoogleIcon className="size-5" />
            Google ile devam et
          </Button>
        </form>
      </div>
    </div>
  );
}
