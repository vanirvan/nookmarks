"use client";

import { useState } from "react";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCollection } from "@/services/features/collections/actions/collections.actions";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
  };
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
}: DeleteCollectionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteCollection({ id: collection.id });

      if (response.success) {
        // Revalidate collections cache
        mutate("collections");
        onOpenChange(false);
      } else {
        alert(response.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Collection</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{collection.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            {isDeleting ? "Deleting..." : "Delete Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
