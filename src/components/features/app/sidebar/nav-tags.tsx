"use client";

import { ChevronRight, Pin, Plus, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { CreateTagDialog } from "@/components/features/tags/create-tag-dialog";
import { DeleteTagDialog } from "@/components/features/tags/delete-tag-dialog";
import { EditTagDialog } from "@/components/features/tags/edit-tag-dialog";
import { TagActionsDropdown } from "@/components/features/tags/tag-actions-dropdown";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarksQuery } from "@/services/features/bookmarks/hooks/use-bookmarks-query";
import { usePreferencesStore } from "@/services/features/bookmarks/store/preferences-store";
import {
  toggleTagPin,
  updateTagColor,
} from "@/services/features/tags/actions/tags.actions";
import { useTagItemCounts } from "@/services/features/tags/hooks/use-tag-item-counts";
import { useTags } from "@/services/features/tags/hooks/use-tags";

type TagWithPaths = {
  id: string;
  userId: string;
  title: string;
  color: "gray" | "green" | "red" | "yellow" | "aqua" | "white" | "black";
  parent: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  fullPath: string;
  fullPathIDs: string;
};

export function NavTags() {
  const { data: tags, isLoading, mutate } = useTags();
  const { data: itemCounts } = useTagItemCounts();
  const { displaySidebarTagItemCounts } = usePreferencesStore();
  const [queryState, setQueryState] = useBookmarksQuery();
  const tagFilter = queryState.tag;
  const { mutate: globalMutate } = useSWRConfig();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagWithPaths | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePinToggle = async (tagId: string) => {
    const result = await toggleTagPin({ tagId });
    if (result.success) {
      toast.success("Tag updated");
      mutate();
      globalMutate((key) => Array.isArray(key) && key[0] === "bookmarks");
    } else {
      toast.error(result.error || "Failed to update tag");
    }
  };

  const handleColorChange = async (
    tagId: string,
    color: "gray" | "green" | "red" | "yellow" | "aqua" | "white" | "black",
  ) => {
    const result = await updateTagColor({ tagId, color });
    if (result.success) {
      toast.success("Color updated");
      mutate();
      globalMutate((key) => Array.isArray(key) && key[0] === "bookmarks");
    } else {
      toast.error(result.error || "Failed to update color");
    }
  };

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tags;

    // Find tags that match title or fullPath
    const matched = tags.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.fullPath.toLowerCase().includes(q),
    );

    // Keep all matched tags and their ancestors so the tree can render down to them
    const visibleIds = new Set<string>();
    for (const tag of matched) {
      const ids = tag.fullPathIDs ? tag.fullPathIDs.split("/") : [tag.id];
      for (const id of ids) {
        visibleIds.add(id);
      }
    }

    return tags.filter((t) => visibleIds.has(t.id));
  }, [tags, searchQuery]);

  const rootTags = useMemo(() => {
    return filteredTags.filter((t) => !t.parent);
  }, [filteredTags]);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Tags</SidebarGroupLabel>
        <SidebarGroupAction onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <div className="px-2 pb-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-8 text-xs bg-muted/40 border-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear tag search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <SidebarMenu>
            {isLoading ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton className="pointer-events-none">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-24" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="pointer-events-none">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-32" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="pointer-events-none">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-20" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : rootTags.length > 0 ? (
              rootTags.map((tag) => (
                <TagTreeItem
                  key={tag.id}
                  tag={tag}
                  allTags={filteredTags}
                  itemCounts={itemCounts || {}}
                  displayCounts={displaySidebarTagItemCounts}
                  activeTagId={tagFilter}
                  searchQuery={searchQuery}
                  onTagClick={(tagId) => {
                    setQueryState({
                      tag: tagFilter === tagId ? null : tagId,
                      page: 1,
                    });
                  }}
                  onEdit={(t) => {
                    setSelectedTag(t);
                    setEditDialogOpen(true);
                  }}
                  onDelete={(t) => {
                    setSelectedTag(t);
                    setDeleteDialogOpen(true);
                  }}
                  onPinToggle={handlePinToggle}
                  onColorChange={handleColorChange}
                />
              ))
            ) : searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-1 px-4">
                <Search className="h-6 w-6 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-medium text-muted-foreground">
                  No tags found
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  No tags match &ldquo;{searchQuery.trim()}&rdquo;
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-1">
                <div className="relative">
                  <Tag className="h-10 w-10 text-muted-foreground/30" />
                  <Plus className="h-4 w-4 text-primary absolute -top-1 -right-1" />
                </div>
                <p className="text-xs font-semibold text-foreground/80 mt-2">
                  Organize with tags
                </p>
                <p className="text-[10px] text-muted-foreground max-w-44 leading-relaxed">
                  Create nested tags using &quot;/&quot; separator
                </p>
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <CreateTagDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedTag && (
        <>
          <EditTagDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            tag={selectedTag}
          />
          <DeleteTagDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            tag={selectedTag}
            hasChildren={
              tags?.some((t) => t.parent === selectedTag.id) || false
            }
          />
        </>
      )}
    </>
  );
}

function TagTreeItem({
  tag,
  allTags,
  itemCounts,
  displayCounts,
  activeTagId,
  searchQuery,
  onTagClick,
  onEdit,
  onDelete,
  onPinToggle,
  onColorChange,
  depth = 0,
}: {
  tag: TagWithPaths;
  allTags: TagWithPaths[];
  itemCounts: Record<string, number>;
  displayCounts: boolean;
  activeTagId: string | null | "untagged";
  searchQuery?: string;
  onTagClick: (tagId: string) => void;
  onEdit: (tag: TagWithPaths) => void;
  onDelete: (tag: TagWithPaths) => void;
  onPinToggle: (tagId: string) => void;
  onColorChange: (
    tagId: string,
    color: "gray" | "green" | "red" | "yellow" | "aqua" | "white" | "black",
  ) => void;
  depth?: number;
}) {
  const children = allTags.filter((t) => t.parent === tag.id);
  const hasChildren = children.length > 0;
  const isActive = activeTagId === tag.id;
  const itemCount = itemCounts[tag.id] || 0;

  const [isOpen, setIsOpen] = useState(depth < 2);

  useEffect(() => {
    if (searchQuery?.trim()) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      gray: "bg-muted-foreground",
      green: "bg-green-500",
      red: "bg-destructive",
      yellow: "bg-yellow-500",
      aqua: "bg-cyan-500",
      white: "bg-background border border-border",
      black: "bg-foreground",
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem className="relative flex items-center w-full">
        {hasChildren ? (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="p-1 hover:bg-accent rounded shrink-0"
              />
            }
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            />
          </CollapsibleTrigger>
        ) : (
          <div className="size-5" />
        )}
        <SidebarMenuButton
          onClick={() => onTagClick(tag.id)}
          isActive={isActive}
          className="flex-1 min-w-0 transition-[padding] duration-200 group-hover/menu-item:pr-10 group-focus-within/menu-item:pr-10"
        >
          <div className={`h-2 w-2 rounded-full ${getColorClass(tag.color)}`} />
          <span className="flex-1 truncate">{tag.title}</span>
          {tag.pinned && (
            <Pin className="h-3 w-3 text-muted-foreground shrink-0 rotate-45" />
          )}
        </SidebarMenuButton>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 opacity-0 transition-opacity">
          <TagActionsDropdown
            isPinned={tag.pinned}
            currentColor={tag.color}
            onEditClick={() => onEdit(tag)}
            onDeleteClick={() => onDelete(tag)}
            onPinToggle={() => onPinToggle(tag.id)}
            onColorChange={(color) => onColorChange(tag.id, color)}
          />
        </div>
        {displayCounts && itemCount > 0 && (
          <SidebarMenuBadge className="mr-8 shrink-0">
            {itemCount}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
      {hasChildren && (
        <CollapsibleContent>
          <div className="pl-4">
            {children.map((child) => (
              <TagTreeItem
                key={child.id}
                tag={child}
                allTags={allTags}
                itemCounts={itemCounts}
                displayCounts={displayCounts}
                activeTagId={activeTagId}
                searchQuery={searchQuery}
                onTagClick={onTagClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onPinToggle={onPinToggle}
                onColorChange={onColorChange}
                depth={depth + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
