import { Suspense } from "react";
import { AppSidebar } from "@/components/features/app/sidebar/app-sidebar";
import { SiteHeader } from "@/components/features/app/sidebar/site-header";
import { SettingsDialog } from "@/components/features/settings/settings-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </div>
        <Suspense fallback={null}>
          <SettingsDialog />
        </Suspense>
      </SidebarProvider>
    </div>
  );
}
