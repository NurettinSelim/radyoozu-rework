"use client";

import { useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DAY_KEYS,
  scheduleWindowSchema,
  type ScheduleWindow,
} from "@/content/schema";
import { saveScheduleWindow } from "@/app/admin/(authed)/schedule-window/actions";

export function ScheduleWindowForm({ initial }: { initial: ScheduleWindow }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ScheduleWindow>({
    resolver: zodResolver(scheduleWindowSchema),
    defaultValues: initial,
  });
  const days = useFieldArray({ control: form.control, name: "days" });

  const onSubmit = (values: ScheduleWindow) => {
    startTransition(async () => {
      try {
        await saveScheduleWindow(values);
        toast.success("Program saatleri kaydedildi");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kaydetme başarısız");
      }
    });
  };

  const errors = form.formState.errors;
  const start = useWatch({ control: form.control, name: "startHour" });
  const end = useWatch({ control: form.control, name: "endHour" });
  const range = typeof end === "number" && typeof start === "number" ? end - start : 0;
  const wideWarning = range > 6;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
          Saat aralığı
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Başlangıç (saat)" error={errors.startHour?.message}>
            <Input
              type="number"
              min={0}
              max={23}
              {...form.register("startHour", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Bitiş (saat)" error={errors.endHour?.message}>
            <Input
              type="number"
              min={1}
              max={24}
              {...form.register("endHour", { valueAsNumber: true })}
            />
          </Field>
        </div>
        {wideWarning && (
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
            Uyarı: Çok geniş bir saat aralığı (6 saatten fazla) masaüstü
            görünümünde uzun bir tabloya yol açar. Mümkünse daha dar bir aralık
            tercih et.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
            Gösterilen günler
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => days.append({ key: "Cuma", label: "Cuma", short: "Cum" })}
            className="rounded-full"
          >
            <Plus className="size-4" />
            Gün ekle
          </Button>
        </div>
        <div className="space-y-3">
          {days.fields.map((field, idx) => (
            <div key={field.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
              <Field label={idx === 0 ? "Anahtar" : undefined} error={errors.days?.[idx]?.key?.message}>
                <select
                  {...form.register(`days.${idx}.key`)}
                  className="h-9 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm"
                >
                  {DAY_KEYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={idx === 0 ? "Etiket (uzun)" : undefined}
                error={errors.days?.[idx]?.label?.message}
              >
                <Input {...form.register(`days.${idx}.label`)} placeholder="Pazartesi" />
              </Field>
              <Field
                label={idx === 0 ? "Kısaltma" : undefined}
                error={errors.days?.[idx]?.short?.message}
              >
                <Input {...form.register(`days.${idx}.short`)} placeholder="Pzt" maxLength={8} />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => days.remove(idx)}
                aria-label="Kaldır"
                className="text-foreground/60 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground/50">
          Bir günü kaldırırsan o günün yayınları masaüstü görünümünde
          gösterilmez; mobilde yine listede çıkar.
        </p>
      </section>

      <div className="flex items-center justify-end border-t border-white/10 pt-6">
        <Button type="submit" size="lg" className="rounded-full" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  label?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
