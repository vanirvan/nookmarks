"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllBookmarksCount,
  useUnsortedBookmarksCount,
} from "@/services/features/bookmarks/hooks/use-bookmarks-count";

export function NavMain() {
  const { data: allCount, isLoading: isLoadingAll } = useAllBookmarksCount();
  const { data: unsortedCount, isLoading: isLoadingUnsorted } =
    useUnsortedBookmarksCount();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/app" />}>
              <LayoutDashboard />
              <span>All Bookmarks</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              {isLoadingAll ? (
                <Skeleton className="size-4 rounded-md" />
              ) : (
                (allCount ?? 0)
              )}
            </SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/app/unsorted" />}>
              <Inbox />
              <span>Unsorted</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              {isLoadingUnsorted ? (
                <Skeleton className="size-4 rounded-md" />
              ) : (
                (unsortedCount ?? 0)
              )}
            </SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
