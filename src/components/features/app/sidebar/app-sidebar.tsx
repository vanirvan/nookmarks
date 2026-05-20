import { NavCollections } from "@/components/features/app/sidebar/nav-collections";
import { NavMain } from "@/components/features/app/sidebar/nav-main";
import { NavUser } from "@/components/features/app/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain />
        <NavCollections />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
