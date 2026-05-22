"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { copySchema, type Copy } from "@/content/schema";
import { saveCopy } from "@/app/admin/(authed)/copy/actions";

export function CopyForm({ initial }: { initial: Copy }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<Copy>({
    resolver: zodResolver(copySchema),
    defaultValues: initial,
  });

  const onSubmit = (values: Copy) => {
    startTransition(async () => {
      try {
        await saveCopy(values);
        toast.success("Metinler kaydedildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kaydetme başarısız");
      }
    });
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      <Section title="Ana sayfa">
        <Field label="Üst etiket" error={errors.home?.eyebrow?.message}>
          <Input {...form.register("home.eyebrow")} />
        </Field>
        <Field label="Hero tagline" error={errors.home?.tagline?.message}>
          <Textarea rows={3} {...form.register("home.tagline")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA — Yayınlar" error={errors.home?.ctaPrograms?.message}>
            <Input {...form.register("home.ctaPrograms")} />
          </Field>
          <Field label="CTA — Spotify" error={errors.home?.ctaSpotify?.message}>
            <Input {...form.register("home.ctaSpotify")} />
          </Field>
        </div>
        <Field label="Telefon etiketi" error={errors.home?.phoneLabel?.message}>
          <Input {...form.register("home.phoneLabel")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bilgi paneli — Stüdyo üst etiket" error={errors.home?.info?.studioEyebrow?.message}>
            <Input {...form.register("home.info.studioEyebrow")} />
          </Field>
          <Field label="Bilgi paneli — Stüdyo başlık" error={errors.home?.info?.studioHeading?.message}>
            <Input {...form.register("home.info.studioHeading")} />
          </Field>
        </div>
        <Field label="Bilgi paneli — İletişim üst etiket" error={errors.home?.info?.contactEyebrow?.message}>
          <Input {...form.register("home.info.contactEyebrow")} />
        </Field>
      </Section>

      <Section title="Yayın akışı sayfası (/yayinlar)">
        <Field label="Üst etiket" error={errors.yayinlar?.eyebrow?.message} hint='Örn: "2025 – 26 Sezonu"'>
          <Input {...form.register("yayinlar.eyebrow")} />
        </Field>
        <Field label="Başlık" error={errors.yayinlar?.headline?.message}>
          <Input {...form.register("yayinlar.headline")} />
        </Field>
        <Field label="Tagline" error={errors.yayinlar?.tagline?.message}>
          <Textarea rows={3} {...form.register("yayinlar.tagline")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Canlı rozeti" error={errors.yayinlar?.liveLegend?.message}>
            <Input {...form.register("yayinlar.liveLegend")} />
          </Field>
          <Field label="Tekrar rozeti" error={errors.yayinlar?.replayLegend?.message}>
            <Input {...form.register("yayinlar.replayLegend")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO başlık" error={errors.yayinlar?.metadataTitle?.message}>
            <Input {...form.register("yayinlar.metadataTitle")} />
          </Field>
          <Field label="SEO açıklama" error={errors.yayinlar?.metadataDescription?.message}>
            <Textarea rows={2} {...form.register("yayinlar.metadataDescription")} />
          </Field>
        </div>
      </Section>

      <Section title="İletişim sayfası (/iletisim)">
        <Field label="Üst etiket" error={errors.iletisim?.eyebrow?.message}>
          <Input {...form.register("iletisim.eyebrow")} />
        </Field>
        <Field label="Başlık" error={errors.iletisim?.headline?.message}>
          <Input {...form.register("iletisim.headline")} />
        </Field>
        <Field label="Tagline" error={errors.iletisim?.tagline?.message}>
          <Textarea rows={3} {...form.register("iletisim.tagline")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Telefon başlığı" error={errors.iletisim?.phoneLabel?.message}>
            <Input {...form.register("iletisim.phoneLabel")} />
          </Field>
          <Field label="Stüdyo başlığı" error={errors.iletisim?.studioLabel?.message}>
            <Input {...form.register("iletisim.studioLabel")} />
          </Field>
          <Field label="Sosyal başlığı" error={errors.iletisim?.socialLabel?.message}>
            <Input {...form.register("iletisim.socialLabel")} />
          </Field>
        </div>
        <Field label="Instagram kartı başlık" error={errors.iletisim?.instagram?.heading?.message}>
          <Input {...form.register("iletisim.instagram.heading")} />
        </Field>
        <Field label="Instagram kartı tagline" error={errors.iletisim?.instagram?.tagline?.message}>
          <Textarea rows={2} {...form.register("iletisim.instagram.tagline")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO başlık" error={errors.iletisim?.metadataTitle?.message}>
            <Input {...form.register("iletisim.metadataTitle")} />
          </Field>
          <Field label="SEO açıklama" error={errors.iletisim?.metadataDescription?.message}>
            <Textarea rows={2} {...form.register("iletisim.metadataDescription")} />
          </Field>
        </div>
      </Section>

      <Section title="Spotify sayfası (/spotify)">
        <Field label="Üst etiket" error={errors.spotify?.eyebrow?.message}>
          <Input {...form.register("spotify.eyebrow")} />
        </Field>
        <Field label="Başlık" error={errors.spotify?.headline?.message}>
          <Input {...form.register("spotify.headline")} />
        </Field>
        <Field label="Tagline" error={errors.spotify?.tagline?.message}>
          <Textarea rows={3} {...form.register("spotify.tagline")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kart üst etiket" error={errors.spotify?.cardEyebrow?.message}>
            <Input {...form.register("spotify.cardEyebrow")} />
          </Field>
          <Field label="Kart başlık" error={errors.spotify?.cardHeading?.message}>
            <Input {...form.register("spotify.cardHeading")} />
          </Field>
        </div>
        <Field label="Kart tagline" error={errors.spotify?.cardTagline?.message}>
          <Input {...form.register("spotify.cardTagline")} />
        </Field>
        <Field label="Kart CTA" error={errors.spotify?.cardCta?.message}>
          <Input {...form.register("spotify.cardCta")} />
        </Field>
        <Field label="İpucu" error={errors.spotify?.tip?.message}>
          <Textarea rows={2} {...form.register("spotify.tip")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO başlık" error={errors.spotify?.metadataTitle?.message}>
            <Input {...form.register("spotify.metadataTitle")} />
          </Field>
          <Field label="SEO açıklama" error={errors.spotify?.metadataDescription?.message}>
            <Textarea rows={2} {...form.register("spotify.metadataDescription")} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end rounded-2xl border border-white/10 bg-background/80 px-4 py-3 backdrop-blur">
        <Button type="submit" size="lg" className="rounded-full" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Tüm metinleri kaydet"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-foreground/50">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
