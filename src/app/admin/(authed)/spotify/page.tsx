import { headers } from "next/headers";
import { CheckCircle2, ListMusic, Music, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSpotifyPlaylists } from "@/lib/spotify";
import { isSpotifyConnected } from "@/lib/spotify-auth-store";
import { callbackUri } from "@/lib/spotify-oauth";
import { disconnectSpotify } from "@/app/admin/(authed)/spotify/actions";

const ERRORS: Record<string, string> = {
  state: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar dene.",
  token: "Spotify token alınamadı. Doğru hesapla giriş yaptığından emin ol.",
  config: "SPOTIFY_CLIENT_ID tanımlı değil. Ortam değişkenlerini kontrol et.",
  access_denied: "Spotify erişimi reddedildi.",
};

export default async function AdminSpotifyPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const connected = await isSpotifyConnected();
  const playlists = connected ? await getSpotifyPlaylists() : [];
  const envPinned = Boolean(process.env.SPOTIFY_REFRESH_TOKEN);

  const h = await headers();
  const redirectUri = callbackUri(h);
  const onLocalhost = (h.get("x-forwarded-host") ?? h.get("host") ?? "").startsWith(
    "localhost",
  );

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl font-semibold tracking-tight">Spotify</h2>
      <p className="mt-1 text-sm text-foreground/65">
        Spotify hesabını bağladığında <code className="text-foreground/80">/spotify</code>{" "}
        sayfası, hesabın en yeni çalma listelerini otomatik olarak gösterir.
      </p>

      {sp.connected && (
        <Banner tone="success" icon={CheckCircle2}>
          Spotify bağlandı. {playlists.length} çalma listesi bulundu.
        </Banner>
      )}
      {sp.error && (
        <Banner tone="error" icon={TriangleAlert}>
          {ERRORS[sp.error] ?? "Bağlantı sırasında bir hata oluştu."}
        </Banner>
      )}
      {onLocalhost && (
        <Banner tone="error" icon={TriangleAlert}>
          Spotify <code>localhost</code> adresini kabul etmez. Bu sayfayı{" "}
          <code>http://127.0.0.1:3000/admin/spotify</code> üzerinden aç.
        </Banner>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <Music className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            {connected ? (
              <>
                <p className="flex items-center gap-2 font-medium text-emerald-300">
                  <CheckCircle2 className="size-4" /> Bağlı
                </p>
                <p className="mt-1 text-sm text-foreground/65">
                  {playlists.length > 0
                    ? `${playlists.length} çalma listesi yayında gösteriliyor.`
                    : "Bağlı, ancak herkese açık çalma listesi bulunamadı."}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Bağlı değil</p>
                <p className="mt-1 text-sm text-foreground/65">
                  Çalma listelerini göstermek için Radyo Özü Spotify hesabıyla bağlan.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            render={<a href="/api/spotify/connect" />}
            size="sm"
            className="rounded-full"
          >
            {connected ? "Yeniden bağlan" : "Spotify'a bağlan"}
          </Button>
          {connected && !envPinned && (
            <form action={disconnectSpotify}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-full border-white/15 bg-white/5"
              >
                Bağlantıyı kes
              </Button>
            </form>
          )}
        </div>

        {envPinned && (
          <p className="mt-4 text-xs text-foreground/50">
            Not: <code>SPOTIFY_REFRESH_TOKEN</code> ortam değişkeni tanımlı; bağlantı
            ondan okunuyor ve buradan kesilemez.
          </p>
        )}
      </div>

      {connected && playlists.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
            Önizleme
          </h2>
          <ul className="mt-3 space-y-2">
            {playlists.slice(0, 8).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 text-sm text-foreground/75"
              >
                <ListMusic className="size-4 shrink-0 text-emerald-300/70" />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto shrink-0 text-xs text-foreground/45">
                  {p.trackCount} parça
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-foreground/60">
        <p className="font-medium text-foreground/80">Kurulum</p>
        <p className="mt-2">
          Spotify panelinde <strong>tam olarak</strong> bu redirect URI’yi kayıtlı tut
          (Settings → Redirect URIs):
        </p>
        <code className="mt-2 block overflow-x-auto rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-emerald-200">
          {redirectUri}
        </code>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>“redirect_uri: Not matching configuration” hatası bu adres birebir eşleşmediğinde çıkar.</li>
          <li>Açılan Spotify ekranında Radyo Özü hesabıyla giriş yap.</li>
          <li>
            Uygulama geliştirme modundaysa, Radyo Özü hesabının Spotify panelinde
            “User Management” listesinde olması gerekir.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "error";
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : "border-destructive/30 bg-destructive/10 text-destructive";
  return (
    <div
      className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </div>
  );
}
