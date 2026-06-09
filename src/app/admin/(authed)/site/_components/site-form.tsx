"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteSchema, type Site } from "@/content/schema";
import { saveSite } from "@/app/admin/(authed)/site/actions";

export function SiteForm({ initial }: { initial: Site }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof siteSchema>, unknown, Site>({
    resolver: zodResolver(siteSchema),
    defaultValues: initial,
  });
  const nav = useFieldArray({ control: form.control, name: "nav" });

  const onSubmit = (values: Site) => {
    startTransition(async () => {
      try {
        await saveSite(values);
        toast.success("Site bilgileri kaydedildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kaydetme başarısız");
      }
    });
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      <Section title="Genel">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad" error={errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Kısa ad" error={errors.shortName?.message}>
            <Input {...form.register("shortName")} />
          </Field>
        </div>
        <Field label="Açıklama" error={errors.description?.message} hint="Site meta description'ı (~160 karakter)">
          <Textarea rows={2} {...form.register("description")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marka — düz kısım" error={errors.brand?.prefix?.message} hint='Örn: "Radyo " (sonunda boşluk)'>
            <Input {...form.register("brand.prefix")} />
          </Field>
          <Field label="Marka — vurgu" error={errors.brand?.accent?.message} hint='Örn: "Özü"'>
            <Input {...form.register("brand.accent")} />
          </Field>
        </div>
        <Field label="Instagram kullanıcı adı" error={errors.instagramHandle?.message} hint="@ işareti olmadan">
          <Input {...form.register("instagramHandle")} />
        </Field>
        <Field label="Kuruluş yılı" error={errors.foundedYear?.message}>
          <Input type="number" {...form.register("foundedYear", { valueAsNumber: true })} />
        </Field>
      </Section>

      <Section title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon (gösterilen)" error={errors.phone?.message}>
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Telefon linki" error={errors.phoneHref?.message} hint="tel: ile başlamalı">
            <Input {...form.register("phoneHref")} />
          </Field>
        </div>
        <Field label="E-posta" error={errors.email?.message} hint="Genel iletişim e-postası">
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Adres" error={errors.address?.message}>
          <Textarea rows={2} {...form.register("address")} />
        </Field>
      </Section>

      <Section title="Canlı yayın (Radio.co)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Yayın URL'si" error={errors.stream?.url?.message}>
            <Input {...form.register("stream.url")} />
          </Field>
          <Field label="API base" error={errors.stream?.apiBase?.message}>
            <Input {...form.register("stream.apiBase")} />
          </Field>
          <Field label="Station ID" error={errors.stream?.stationId?.message}>
            <Input {...form.register("stream.stationId")} />
          </Field>
          <Field label="Logo URL" error={errors.stream?.logo?.message}>
            <Input {...form.register("stream.logo")} />
          </Field>
        </div>
      </Section>

      <Section title="Sosyal medya">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Spotify" error={errors.socials?.spotify?.message}>
            <Input {...form.register("socials.spotify")} />
          </Field>
          <Field label="Twitter / X" error={errors.socials?.twitter?.message}>
            <Input {...form.register("socials.twitter")} />
          </Field>
          <Field label="Instagram" error={errors.socials?.instagram?.message}>
            <Input {...form.register("socials.instagram")} />
          </Field>
          <Field label="YouTube" error={errors.socials?.youtube?.message}>
            <Input {...form.register("socials.youtube")} />
          </Field>
        </div>
      </Section>

      <Section title="Üst menü">
        <div className="space-y-3">
          {nav.fields.map((field, idx) => (
            <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Field
                label={idx === 0 ? "Etiket" : undefined}
                error={errors.nav?.[idx]?.label?.message}
              >
                <Input {...form.register(`nav.${idx}.label`)} placeholder="Canlı Yayın" />
              </Field>
              <Field
                label={idx === 0 ? "URL" : undefined}
                error={errors.nav?.[idx]?.href?.message}
              >
                <Input {...form.register(`nav.${idx}.href`)} placeholder="/yayinlar" />
              </Field>
              <div className={idx === 0 ? "self-end" : ""}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => nav.remove(idx)}
                  aria-label="Kaldır"
                  className="text-foreground/60 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => nav.append({ label: "", href: "/" })}
            className="rounded-full"
          >
            <Plus className="size-4" />
            Menü öğesi ekle
          </Button>
        </div>
      </Section>

      <div className="flex items-center justify-end border-t border-white/10 pt-6">
        <Button type="submit" size="lg" className="rounded-full" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
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
      {children}
    </section>
  );
}

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-foreground/50">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
