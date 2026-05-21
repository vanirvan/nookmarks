"use client";

import { Loader2, RefreshCw, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteBookmarks,
  bulkRefetchMetadata,
} from "@/services/features/bookmarks/actions/bookmarks.actions";
import { useSelectionStore } from "@/services/features/bookmarks/store/selection-store";
import { BulkTagUpdateDialog } from "./bulk-tag-update-dialog";

export function BulkActionsToolbar() {
  const { selectedIds, clearSelection } = useSelectionStore();
  const { mutate } = useSWRConfig();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  const selectedCount = selectedIds.length;

  if (selectedCount === 0) return null;

  const triggerMutate = () => {
    mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
    mutate("all-bookmarks-count");
    mutate("unsorted-bookmarks-count");
    mutate("untagged-bookmarks-count");
    mutate("tag-item-counts");
  };

  const handleRefetch = async () => {
    if (isRefetching) return;
    setIsRefetching(true);
    const toastId = toast.loading(
      `Refetching metadata for ${selectedCount} bookmark${selectedCount > 1 ? "s" : ""}...`,
    );

    try {
      const response = await bulkRefetchMetadata({ bookmarkIds: selectedIds });

      if (response.success) {
        const { successful, failed } = response.data;
        toast.success(
          `Successfully refetched metadata! Successful: ${successful}, Failed: ${failed}`,
          { id: toastId },
        );
        triggerMutate();
        clearSelection();
      } else {
        toast.error(response.error || "Failed to refetch metadata", {
          id: toastId,
        });
      }
    } catch {
      toast.error("An error occurred during refetching", { id: toastId });
    } finally {
      setIsRefetching(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    if (isDeleting) return;
    setIsDeleting(true);
    const toastId = toast.loading(
      `Deleting ${selectedCount} bookmark${selectedCount > 1 ? "s" : ""}...`,
    );

    try {
      const response = await bulkDeleteBookmarks({ bookmarkIds: selectedIds });

      if (response.success) {
        toast.success(
          `Successfully deleted ${response.data.count} bookmark${response.data.count > 1 ? "s" : ""}`,
          { id: toastId },
        );
        triggerMutate();
        clearSelection();
      } else {
        toast.error(response.error || "Failed to delete bookmarks", {
          id: toastId,
        });
      }
    } catch {
      toast.error("An error occurred during deletion", { id: toastId });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full border bg-background/85 backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 pl-1 pr-2 border-r border-border h-6 shrink-0">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {selectedCount}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            selected
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refetch */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefetch}
            disabled={isRefetching || isDeleting}
            title="Refetch metadata"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>

          {/* Tags - opens BulkTagUpdateDialog */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTagDialogOpen(true)}
            disabled={isRefetching || isDeleting}
            title="Update tags"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Tag className="h-4 w-4" />
          </Button>

          {/* Delete with inline double-confirm */}
          <Button
            variant={confirmDelete ? "destructive" : "ghost"}
            size={confirmDelete ? "sm" : "icon-sm"}
            onClick={handleDelete}
            disabled={isRefetching || isDeleting}
            className={`h-8 transition-all duration-200 gap-1.5 ${
              confirmDelete
                ? "px-3 text-[11px] font-semibold animate-pulse"
                : "w-8 text-muted-foreground hover:text-destructive"
            }`}
            title="Delete selected"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : confirmDelete ? (
              <span>Confirm Delete?</span>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="border-l border-border h-6 pl-1.5 shrink-0 flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearSelection}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
            title="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <BulkTagUpdateDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
      />
    </>
  );
}
