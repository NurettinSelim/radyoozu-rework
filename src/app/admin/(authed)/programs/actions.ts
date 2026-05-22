"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { readContent, writeContent } from "@/lib/content-store";
import { programSchema, type Program } from "@/content/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Yetkisiz erişim");
}

type ProgramFormInput = Omit<Program, "hosts"> & { hostsText: string };

function toProgram(input: ProgramFormInput): Program {
  const hosts = input.hostsText
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hostsText, ...rest } = input;
  return { ...rest, hosts };
}

export async function saveProgram(originalSlug: string, input: ProgramFormInput) {
  await requireAdmin();
  const program = programSchema.parse(toProgram(input));
  const programs = await readContent("programs");
  const idx = programs.findIndex((p) => p.slug === originalSlug);
  if (idx < 0) throw new Error(`Yayın bulunamadı: ${originalSlug}`);
  if (program.slug !== originalSlug && programs.some((p) => p.slug === program.slug)) {
    throw new Error(`Bu slug zaten kullanılıyor: ${program.slug}`);
  }
  programs[idx] = program;
  await writeContent("programs", programs);
  updateTag("programs");
  redirect(`/admin/programs/${program.slug}`);
}

export async function createProgram(input: ProgramFormInput) {
  await requireAdmin();
  const program = programSchema.parse(toProgram(input));
  const programs = await readContent("programs");
  if (programs.some((p) => p.slug === program.slug)) {
    throw new Error(`Bu slug zaten kullanılıyor: ${program.slug}`);
  }
  programs.push(program);
  await writeContent("programs", programs);
  updateTag("programs");
  redirect(`/admin/programs/${program.slug}`);
}

export async function deleteProgram(slug: string) {
  await requireAdmin();
  const programs = await readContent("programs");
  const filtered = programs.filter((p) => p.slug !== slug);
  if (filtered.length === programs.length) {
    throw new Error(`Yayın bulunamadı: ${slug}`);
  }
  await writeContent("programs", filtered);
  updateTag("programs");
  redirect("/admin/programs");
}
