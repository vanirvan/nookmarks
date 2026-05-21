"use client";

import { Inbox, LayoutDashboard, Tag } from "lucide-react";
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
  useUntaggedBookmarksCount,
} from "@/services/features/bookmarks/hooks/use-bookmarks-count";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";

export function NavMain() {
  const { data: allCount, isLoading: isLoadingAll } = useAllBookmarksCount();
  const { data: unsortedCount, isLoading: isLoadingUnsorted } =
    useUnsortedBookmarksCount();
  const { data: untaggedCount, isLoading: isLoadingUntagged } =
    useUntaggedBookmarksCount();
  const { tagFilter, setTagFilter } = useViewStore();

  const handleUntaggedClick = () => {
    setTagFilter(tagFilter === "untagged" ? null : "untagged");
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              render={<Link href="/app" />}
              isActive={tagFilter === null}
            >
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
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleUntaggedClick}
              isActive={tagFilter === "untagged"}
            >
              <Tag />
              <span>Untagged</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>
              {isLoadingUntagged ? (
                <Skeleton className="size-4 rounded-md" />
              ) : (
                (untaggedCount ?? 0)
              )}
            </SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
