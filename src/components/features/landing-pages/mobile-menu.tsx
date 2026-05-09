"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobileMenuStore } from "@/services/features/landing-pages/store/mobile-menu";

export function MobileMenuToggler() {
  const { open, onOpenChange } = useMobileMenuStore();

  return (
    <Button
      onClick={() => onOpenChange(!open)}
      className="hover:bg-foreground/5 -mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 transition-colors sm:hidden"
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
}

export function MobileMenuContent({
  navLinks,
}: {
  navLinks: { name: string; to: string }[];
}) {
  const { open, onOpenChange } = useMobileMenuStore();

  return (
    <div
      className={cn(
        "fixed inset-0 top-20 z-40 transition-all duration-300 sm:hidden",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "bg-background/80 border-foreground/10 absolute top-4 right-4 left-4 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="p-2 sm:hidden">
            <AnimatedThemeToggler />
          </div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.to}
              onClick={() => onOpenChange(false)}
              className="hover:bg-foreground/5 rounded-xl px-4 py-4 text-lg font-medium"
            >
              {link.name}
            </a>
          ))}
          <div className="py-2">
            <Link
              href="/sign-in"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
