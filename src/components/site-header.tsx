"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/site";

type Props = {
  nav: NavItem[];
  brand: { prefix: string; accent: string };
};

export function SiteHeader({ nav, brand }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight"
        >
          <Image
            src="/radyoozu-logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-10 shrink-0 rounded-md object-contain outline outline-1 -outline-offset-1 outline-white/10"
          />
          <span className="text-base">
            {brand.prefix}
            <span className="text-primary">{brand.accent}</span>
          </span>
        </Link>

        <nav aria-label="Ana menü" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm text-foreground/70 transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/5 hover:text-foreground active:scale-[0.96]",
                      active &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menüyü aç"
                  className="relative after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  {brand.prefix}
                  {brand.accent}
                </SheetTitle>
              </SheetHeader>
              <ul className="mt-4 flex flex-col gap-1 px-4 pb-6">
                {nav.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <SheetClose
                        render={
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/5 active:scale-[0.96]",
                              active && "bg-primary text-primary-foreground",
                            )}
                          >
                            {item.label}
                          </Link>
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
