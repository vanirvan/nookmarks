import { NavBreadcrumb } from "@/components/features/app/sidebar/nav-breadcrumb";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="data-vertical:h-4 data-vertical:self-auto"
          />
          <NavBreadcrumb />
        </div>
        <AnimatedThemeToggler />
      </div>
    </header>
  );
}
