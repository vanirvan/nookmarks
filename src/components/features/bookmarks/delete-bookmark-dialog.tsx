"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteBookmark } from "@/services/features/bookmarks/actions/bookmarks.actions";

interface DeleteBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: {
    id: string;
    type: "bookmark" | "image" | null;
    url: string | null;
    description: string | null;
    aiMetadata?: Record<string, unknown> | null;
  };
}

export function DeleteBookmarkDialog({
  open,
  onOpenChange,
  bookmark,
}: DeleteBookmarkDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();

  const metadata = (bookmark.aiMetadata || {}) as Record<string, string>;
  const title =
    metadata.extractedTitle ||
    bookmark.description ||
    bookmark.url ||
    (bookmark.type === "image" ? "Image Bookmark" : "Bookmark");

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting bookmark...");
    try {
      const response = await deleteBookmark({ id: bookmark.id });

      if (response.success) {
        toast.success("Bookmark deleted successfully", { id: toastId });

        // Revalidate all bookmark-related keys
        mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
        mutate("all-bookmarks-count");
        mutate("unsorted-bookmarks-count");
        mutate("untagged-bookmarks-count");
        mutate("tag-item-counts");

        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to delete bookmark", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("An error occurred", { id: toastId });
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Bookmark</DialogTitle>
          <DialogDescription className="break-all">
            Are you sure you want to delete "{title}"? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
