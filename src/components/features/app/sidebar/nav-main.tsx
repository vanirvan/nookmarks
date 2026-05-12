import { Inbox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/app" />}>
              <LayoutDashboard />
              <span>All Bookmarks</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>128</SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/app/unsorted" />}>
              <Inbox />
              <span>Unsorted</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>24</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
