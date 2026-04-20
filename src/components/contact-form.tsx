"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  email: z.string().email("Geçerli bir e-posta gir"),
  message: z.string().min(10, "En az 10 karakter yaz"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Mesajın bize ulaştı. Teşekkürler!");
      reset();
    } catch {
      toast.error("Gönderilemedi, birazdan tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Adın</Label>
          <Input id="name" placeholder="Adını yaz" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@ozu.edu.tr"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Mesajın</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Öneri, şarkı isteği, geri bildirim…"
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] px-6 text-white"
      >
        <Send className="size-4" />
        {submitting ? "Gönderiliyor…" : "Gönder"}
      </Button>
    </form>
  );
}
