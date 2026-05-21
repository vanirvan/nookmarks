"use client";

import { Search, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { bulkUpdateTags } from "@/services/features/bookmarks/actions/bookmarks.actions";
import { useBookmarks } from "@/services/features/bookmarks/hooks/use-bookmarks";
import { useSelectionStore } from "@/services/features/bookmarks/store/selection-store";
import { useTags } from "@/services/features/tags/hooks/use-tags";

interface BulkTagUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TagCheckState = "checked" | "unchecked" | "indeterminate";

export function BulkTagUpdateDialog({
  open,
  onOpenChange,
}: BulkTagUpdateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { selectedIds, clearSelection } = useSelectionStore();
  const { data: allTags } = useTags();
  const { data } = useBookmarks();
  const bookmarksList = data?.bookmarks;
  const { mutate } = useSWRConfig();

  // Calculate initial tag states based on current selection
  const initialTagStates = useMemo<Record<string, TagCheckState>>(() => {
    if (!bookmarksList || !allTags || selectedIds.length === 0) return {};

    const selectedBookmarks = bookmarksList.filter((b) =>
      selectedIds.includes(b.id),
    );
    const states: Record<string, TagCheckState> = {};

    allTags.forEach((tag) => {
      const bookmarksWithTag = selectedBookmarks.filter((b) =>
        b.bookmarkTags.some((bt) => bt.tagId === tag.id),
      );

      if (bookmarksWithTag.length === 0) {
        states[tag.id] = "unchecked";
      } else if (bookmarksWithTag.length === selectedBookmarks.length) {
        states[tag.id] = "checked";
      } else {
        states[tag.id] = "indeterminate";
      }
    });

    return states;
  }, [bookmarksList, allTags, selectedIds]); // `open` bukan dependency yang dibaca — dihapus

  // Local state for user modifications (starts from initial)
  const [tagStates, setTagStates] =
    useState<Record<string, TagCheckState>>(initialTagStates);

  // Track previous value of `open` to detect the false→true transition
  const prevOpenRef = useRef(false);

  // Re-sync tagStates HANYA ketika dialog baru saja dibuka (false → true)
  // Tidak reset saat initialTagStates berubah di background (mis. SWR re-fetch)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTagStates(initialTagStates);
    }
    prevOpenRef.current = open;
  }, [open, initialTagStates]);

  const filteredTags = useMemo(() => {
    if (!allTags) return [];
    if (!searchQuery.trim()) return allTags;
    const q = searchQuery.toLowerCase();
    return allTags.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.fullPath.toLowerCase().includes(q),
    );
  }, [allTags, searchQuery]);

  const handleToggleTag = (tagId: string) => {
    setTagStates((prev) => {
      const current = prev[tagId] ?? "unchecked";
      // Cycle: unchecked/indeterminate → checked → unchecked
      const next: TagCheckState =
        current === "checked" ? "unchecked" : "checked";
      return { ...prev, [tagId]: next };
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const tagsToAdd: string[] = [];
    const tagsToRemove: string[] = [];

    // Only process tags whose state differs from initial
    Object.entries(tagStates).forEach(([tagId, state]) => {
      const initial = initialTagStates[tagId] ?? "unchecked";
      if (state === initial) return; // no change
      if (state === "checked") tagsToAdd.push(tagId);
      if (state === "unchecked") tagsToRemove.push(tagId);
    });

    if (tagsToAdd.length === 0 && tagsToRemove.length === 0) {
      toast.info("No tag changes to apply");
      onOpenChange(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await bulkUpdateTags({
        bookmarkIds: selectedIds,
        tagsToAdd,
        tagsToRemove,
      });

      if (response.success) {
        const parts = [];
        if (tagsToAdd.length > 0)
          parts.push(
            `added ${tagsToAdd.length} tag${tagsToAdd.length > 1 ? "s" : ""}`,
          );
        if (tagsToRemove.length > 0)
          parts.push(
            `removed ${tagsToRemove.length} tag${tagsToRemove.length > 1 ? "s" : ""}`,
          );
        toast.success(
          `Updated ${response.data.updated} bookmark${response.data.updated > 1 ? "s" : ""} — ${parts.join(", ")}`,
        );

        mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
        mutate("tag-item-counts");
        clearSelection();
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to update tags");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const tagColorMap: Record<string, string> = {
    gray: "#6b7280",
    green: "#10b981",
    red: "#ef4444",
    yellow: "#f59e0b",
    aqua: "#06b6d4",
    black: "#000000",
    white: "#d1d5db",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Update Tags</DialogTitle>
              <DialogDescription>
                {selectedIds.length} bookmark{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
          <span className="flex items-center gap-1.5">
            <Checkbox
              checked={true}
              className="h-3.5 w-3.5 pointer-events-none"
            />
            Add to all
          </span>
          <span className="flex items-center gap-1.5">
            <Checkbox
              indeterminate={true}
              className="h-3.5 w-3.5 pointer-events-none"
            />
            Partial (no change)
          </span>
          <span className="flex items-center gap-1.5">
            <Checkbox
              checked={false}
              className="h-3.5 w-3.5 pointer-events-none"
            />
            Remove from all
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tag list */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 -mr-1">
          {filteredTags.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tags found
            </p>
          )}
          {filteredTags.map((tag) => {
            const state = tagStates[tag.id] ?? "unchecked";
            const isChecked = state === "checked";
            const isIndeterminate = state === "indeterminate";

            return (
              <button
                key={tag.id}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group"
                onClick={() => handleToggleTag(tag.id)}
              >
                <Checkbox
                  checked={isChecked}
                  indeterminate={isIndeterminate}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => handleToggleTag(tag.id)}
                  className="shrink-0"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: tagColorMap[tag.color] ?? "#6b7280",
                  }}
                />
                <span className="flex-1 min-w-0 text-sm font-medium truncate">
                  {tag.fullPath}
                </span>
                {isIndeterminate && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    partial
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Apply Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
