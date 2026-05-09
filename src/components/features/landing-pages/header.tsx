import Link from "next/link";
import {
  MobileMenuContent,
  MobileMenuToggler,
} from "@/components/features/landing-pages/mobile-menu";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Features", to: "#features" },
  { name: "Pricing", to: "#pricing" },
  { name: "FAQ", to: "#faq" },
];

export function Header() {
  return (
    <header className="fixed top-4 right-4 left-4 z-50 sm:left-1/2 sm:w-full sm:max-w-5xl sm:-translate-x-1/2">
      <div className="border-foreground/5 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:rounded-full">
        <Link href="/" className="text-xl font-bold sm:text-2xl">
          Nookmarks
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <MenuItem key={link.name} itemName={link.name} to={link.to} />
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex">
            <AnimatedThemeToggler />
          </div>
          <Link href="/sign-in">
            <Button className="hidden sm:inline-flex">Sign In</Button>
          </Link>

          <MobileMenuToggler />
        </div>
      </div>

      <MobileMenuContent navLinks={navLinks} />
    </header>
  );
}

function MenuItem({ itemName, to }: { itemName: string; to: string }) {
  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative py-2 text-sm font-medium"
    >
      {itemName}
      <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"></span>
    </a>
  );
}
