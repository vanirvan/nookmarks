"use client";

import { ChevronRight, Info, Pin, Plus, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreferencesStore } from "@/services/features/bookmarks/store/preferences-store";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";
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
  description: string | null;
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
  const { tagFilter, setTagFilter } = useViewStore();

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
    } else {
      toast.error(result.error || "Failed to update color");
    }
  };

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase().trim();
    return tags.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.fullPath.toLowerCase().includes(q),
    );
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
                className="pl-8 h-8 text-xs bg-muted/40 border-none"
              />
            </div>
          </div>
          <SidebarMenu>
            {isLoading ? (
              <>
                <SidebarMenuItem>
                  <Skeleton className="h-8 w-full" />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Skeleton className="h-8 w-full" />
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
                  onTagClick={(tagId) =>
                    setTagFilter(tagFilter === tagId ? null : tagId)
                  }
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
                  Create nested tags using "/" separator
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
    <Collapsible defaultOpen={depth < 2}>
      <SidebarMenuItem className="relative flex items-center w-full">
        {hasChildren && (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="p-1 hover:bg-accent rounded shrink-0"
              />
            }
          >
            <ChevronRight className="h-3 w-3 transition-transform [[data-state=open]>&]:rotate-90" />
          </CollapsibleTrigger>
        )}
        <SidebarMenuButton
          onClick={() => onTagClick(tag.id)}
          isActive={isActive}
          className="flex-1 min-w-0 group/tag"
        >
          <div className={`h-2 w-2 rounded-full ${getColorClass(tag.color)}`} />
          <span className="flex-1 truncate">{tag.title}</span>
          {tag.pinned && (
            <Pin className="h-3 w-3 text-muted-foreground shrink-0 rotate-45" />
          )}
          {tag.description && (
            <Info className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </SidebarMenuButton>
        {tag.description && (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="absolute left-0 top-0 w-full h-full pointer-events-none" />
              }
            />
            <TooltipContent>
              <p className="max-w-xs">{tag.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 group-hover/tag:opacity-100 opacity-0 transition-opacity">
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
