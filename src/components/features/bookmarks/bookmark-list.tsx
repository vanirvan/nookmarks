"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/services/features/bookmarks/hooks/use-bookmarks";
import { useBookmarksQuery } from "@/services/features/bookmarks/hooks/use-bookmarks-query";
import { useSelectionStore } from "@/services/features/bookmarks/store/selection-store";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkTable } from "./bookmark-table";
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
  const { data, isLoading } = useBookmarks(collectionId);
  const bookmarks = data?.bookmarks || [];
  const totalCount = data?.totalCount || 0;

  const [queryState, setQueryState] = useBookmarksQuery();
  const page = queryState.page;
  const pageSize = queryState["per-page"];

  const pageCount = Math.ceil(totalCount / pageSize);
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  const { view } = useViewStore();
  const { selectedIds, selectAll, clearSelection, setSelectedIds } =
    useSelectionStore();

  const visibleIds = useMemo(() => bookmarks.map((b) => b.id), [bookmarks]);

  // Prune selection when visible bookmarks change
  useEffect(() => {
    const activeIds = new Set(visibleIds);
    const pruned = selectedIds.filter((id) => activeIds.has(id));
    if (pruned.length !== selectedIds.length) {
      setSelectedIds(pruned);
    }
  }, [visibleIds, selectedIds, setSelectedIds]);

  // Select All checkbox state derivation
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => selectedIds.includes(id));

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

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No bookmarks found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Select All bar — only show if there are bookmarks */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <button
          type="button"
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => selectAll(visibleIds)}
        >
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={() => selectAll(visibleIds)}
          />
          <span>
            {allVisibleSelected
              ? "Deselect all"
              : someVisibleSelected
                ? `${selectedIds.filter((id) => visibleIds.includes(id)).length} of ${visibleIds.length} selected`
                : "Select all"}
          </span>
        </button>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {view === "table" ? (
        <BookmarkTable bookmarks={bookmarks} />
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} view={view} />
          ))}
        </div>
      )}

      {/* Centralized Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-1 mt-6 border-t border-border/40">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{startRow}</span> to{" "}
            <span className="font-medium text-foreground">{endRow}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            bookmarks
          </div>

          <div className="flex items-center gap-4">
            {/* Page Size Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setQueryState({
                    "per-page": Number(e.target.value),
                    page: 1,
                  });
                }}
                className="h-8 rounded-lg border border-input bg-background/50 px-2 py-1 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => setQueryState({ page: page - 1 })}
                disabled={page <= 1}
              >
                Prev
              </Button>

              {/* Responsive Page Numbers */}
              {Array.from({ length: pageCount }, (_, i) => i).map(
                (pageNumber) => {
                  const pageIndex = page - 1;
                  const isFirst = pageNumber === 0;
                  const isLast = pageNumber === pageCount - 1;
                  const isAround = Math.abs(pageNumber - pageIndex) <= 1;

                  if (!isFirst && !isLast && !isAround) {
                    if (pageNumber === 1 || pageNumber === pageCount - 2) {
                      return (
                        <span
                          key={`ellipsis-${pageNumber}`}
                          className="text-xs px-1 text-muted-foreground/60 select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={`page-${pageNumber}`}
                      variant={pageIndex === pageNumber ? "default" : "outline"}
                      size="icon-sm"
                      className="h-8 w-8 text-xs font-semibold"
                      onClick={() => setQueryState({ page: pageNumber + 1 })}
                    >
                      {pageNumber + 1}
                    </Button>
                  );
                },
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => setQueryState({ page: page + 1 })}
                disabled={page >= pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <BulkActionsToolbar />
    </>
  );
}
