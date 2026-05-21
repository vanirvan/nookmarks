"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTag } from "@/services/features/tags/actions/tags.actions";

interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: {
    id: string;
    title: string;
    fullPath: string;
  };
  hasChildren: boolean;
}

export function DeleteTagDialog({
  open,
  onOpenChange,
  tag,
  hasChildren,
}: DeleteTagDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteTag({ tagId: tag.id });
      if (result.success) {
        toast.success("Tag deleted successfully");
        mutate("tags");
        mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
        mutate("untagged-bookmarks-count");
        mutate("tag-item-counts");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete tag");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tag</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{tag.fullPath}"?
          </DialogDescription>
        </DialogHeader>
        {hasChildren && (
          <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Warning</p>
              <p className="text-muted-foreground ">
                This tag has child tags. Deleting it will also delete all child
                tags and remove all bookmark associations.
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Tag"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
