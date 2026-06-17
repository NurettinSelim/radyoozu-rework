"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DAY_KEYS, type Program } from "@/content/schema";
import {
  createProgram,
  deleteProgram,
  saveProgram,
} from "@/app/admin/(authed)/programs/actions";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Hex renk: örn. #bb205d");

const formSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
    title: z.string().min(1, "Başlık zorunlu"),
    tagline: z.string().min(1, "Tagline zorunlu"),
    description: z.string().min(1, "Açıklama zorunlu"),
    day: z.enum(DAY_KEYS),
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
    hostsText: z.string().min(1, "En az bir sunucu"),
    instagramHandle: z
      .string()
      .regex(/^@?[a-zA-Z0-9._]+$/, "Geçersiz kullanıcı adı")
      .or(z.literal(""))
      .optional(),
    accentFrom: hexColor,
    accentTo: hexColor,
  })
  .refine((p) => p.endHour > p.startHour, {
    message: "Bitiş saati başlangıçtan sonra olmalı",
    path: ["endHour"],
  });

type FormValues = z.infer<typeof formSchema>;

type Props = {
  mode: "create" | "edit";
  initial?: Program;
};

const DEFAULT_VALUES: FormValues = {
  slug: "",
  title: "",
  tagline: "",
  description: "",
  day: "Pazartesi",
  startHour: 19,
  endHour: 20,
  hostsText: "",
  instagramHandle: "",
  accentFrom: "#bb205d",
  accentTo: "#94205a",
};

export function ProgramForm({ mode, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          slug: initial.slug,
          title: initial.title,
          tagline: initial.tagline,
          description: initial.description,
          day: initial.day,
          startHour: initial.startHour,
          endHour: initial.endHour,
          hostsText: initial.hosts.join(", "),
          instagramHandle: initial.instagramHandle ?? "",
          accentFrom: initial.accentFrom,
          accentTo: initial.accentTo,
        }
      : DEFAULT_VALUES,
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProgram(values);
        } else if (initial) {
          await saveProgram(initial.slug, values);
        }
        toast.success("Kaydedildi · değişiklik birkaç saniye içinde yayında");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kaydetme başarısız";
        if (!msg.includes("NEXT_REDIRECT")) toast.error(msg);
      }
    });
  };

  const onDelete = () => {
    if (!initial) return;
    if (!confirm(`"${initial.title}" yayınını silmek istediğine emin misin?`)) return;
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteProgram(initial.slug);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Silme başarısız";
        if (!msg.includes("NEXT_REDIRECT")) {
          toast.error(msg);
          setDeleting(false);
        }
      }
    });
  };

  const errors = form.formState.errors;
  const accentFrom = useWatch({ control: form.control, name: "accentFrom" });
  const accentTo = useWatch({ control: form.control, name: "accentTo" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (URL kimliği)" error={errors.slug?.message} hint="Sadece küçük harf, rakam, tire. Örn: b-side">
            <Input {...form.register("slug")} placeholder="b-side" />
          </Field>
          <Field label="Başlık" error={errors.title?.message}>
            <Input {...form.register("title")} placeholder="B-Side" />
          </Field>
        </div>
        <Field label="Tagline" error={errors.tagline?.message} hint="Kısa açıklama (kart üzerinde görünür)">
          <Input {...form.register("tagline")} />
        </Field>
        <Field label="Açıklama" error={errors.description?.message}>
          <Textarea rows={4} {...form.register("description")} />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
          Yayın saati
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Gün" error={errors.day?.message}>
            <select
              {...form.register("day")}
              className="h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm"
            >
              {DAY_KEYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Başlangıç (saat)" error={errors.startHour?.message}>
            <Input type="number" min={0} max={23} {...form.register("startHour", { valueAsNumber: true })} />
          </Field>
          <Field label="Bitiş (saat)" error={errors.endHour?.message}>
            <Input type="number" min={1} max={24} {...form.register("endHour", { valueAsNumber: true })} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <Field
          label="Sunucular"
          error={errors.hostsText?.message}
          hint="Virgülle ayır (örn: Ada Yılmaz, Mert Demir)"
        >
          <Input {...form.register("hostsText")} placeholder="Ada Yılmaz, Mert Demir" />
        </Field>
        <Field
          label="Instagram"
          error={errors.instagramHandle?.message}
          hint="@ olmadan kullanıcı adı (örn: bside_radyo). Boş bırakılabilir."
        >
          <Input {...form.register("instagramHandle")} placeholder="bside_radyo" />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
          Kart renkleri
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Başlangıç rengi" error={errors.accentFrom?.message} register={form.register("accentFrom")} value={accentFrom} onChange={(v) => form.setValue("accentFrom", v, { shouldValidate: true })} />
          <ColorField label="Bitiş rengi" error={errors.accentTo?.message} register={form.register("accentTo")} value={accentTo} onChange={(v) => form.setValue("accentTo", v, { shouldValidate: true })} />
        </div>
        <div
          className="h-16 rounded-xl border border-white/10"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${accentFrom}cc, ${accentTo}b3)`,
          }}
          aria-hidden
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
        <Button type="submit" size="lg" className="rounded-full" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : mode === "create" ? "Yayını oluştur" : "Değişiklikleri kaydet"}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isPending || deleting}
            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            {deleting ? "Siliniyor…" : "Bu yayını sil"}
          </Button>
        )}
      </div>
    </form>
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
      {hint && !error && (
        <p className="text-xs text-foreground/50">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

type ColorFieldProps = {
  label: string;
  error?: string;
  register: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
  value: string;
  onChange: (v: string) => void;
};

function ColorField({ label, error, register, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded-md border border-white/15 bg-transparent"
          aria-label={`${label} seçici`}
        />
        <Input {...register} placeholder="#bb205d" className="flex-1" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
