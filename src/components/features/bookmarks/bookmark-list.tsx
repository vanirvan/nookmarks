"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/services/features/bookmarks/hooks/use-bookmarks";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";
import { BookmarkCard } from "./bookmark-card";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";

interface BookmarkListProps {
  collectionId?: string | null;
}

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

export function BookmarkList({ collectionId }: BookmarkListProps) {
  const { data: bookmarks, isLoading } = useBookmarks(collectionId);
  const { view, search, sortBy } = useViewStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredAndSortedBookmarks = useMemo(() => {
    if (!bookmarks) return [];

    let filtered = [...bookmarks];

    // Search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.url?.toLowerCase().includes(s) ||
          b.description?.toLowerCase().includes(s) ||
          b.bookmarkTags.some((t) => t.tag.title.toLowerCase().includes(s)),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "a-z") {
        const titleA = a.description || a.url || "";
        const titleB = b.description || b.url || "";
        return titleA.localeCompare(titleB);
      }
      if (sortBy === "z-a") {
        const titleA = a.description || a.url || "";
        const titleB = b.description || b.url || "";
        return titleB.localeCompare(titleA);
      }
      return 0;
    });

    return filtered;
  }, [bookmarks, search, sortBy]);

  // Keep selection synchronized with current visible bookmarks
  useEffect(() => {
    setSelectedIds((prev) => {
      const activeIds = new Set(filteredAndSortedBookmarks.map((b) => b.id));
      const updated = prev.filter((id) => activeIds.has(id));
      if (updated.length !== prev.length) {
        return updated;
      }
      return prev;
    });
  }, [filteredAndSortedBookmarks]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
        }
      >
        {SKELETON_KEYS.map((key) => (
          <Skeleton
            key={key}
            className={
              view === "grid" ? "aspect-video rounded-xl" : "h-20 rounded-xl"
            }
          />
        ))}
      </div>
    );
  }

  if (filteredAndSortedBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No bookmarks found.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
        }
      >
        {filteredAndSortedBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            view={view}
            isSelected={selectedIds.includes(bookmark.id)}
            isSelectMode={selectedIds.length > 0}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
      />
    </>
  );
}
