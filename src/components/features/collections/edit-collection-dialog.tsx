"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVAILABLE_ICONS } from "@/lib/collection-icons";
import { cn } from "@/lib/utils";
import { updateCollectionSchema } from "@/lib/validations/collections";
import { updateCollection } from "@/services/features/collections/actions/collections.actions";

type UpdateCollectionFormValues = z.infer<typeof updateCollectionSchema>;

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
}: EditCollectionDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>(
    collection.icon || "Folder",
  );
  const [iconSearch, setIconSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateCollectionFormValues>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      id: collection.id,
      name: collection.name,
      icon: collection.icon || "Folder",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: collection.id,
        name: collection.name,
        icon: collection.icon || "Folder",
      });
      setSelectedIcon(collection.icon || "Folder");
      setIconSearch("");
    }
  }, [open, collection, form]);

  const filteredIcons = AVAILABLE_ICONS.filter(({ name }) =>
    name.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const onSubmit = async (data: UpdateCollectionFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await updateCollection({
        id: collection.id,
        name: data.name,
        icon: selectedIcon,
      });

      if (response.success) {
        // Revalidate collections cache
        mutate("collections");

        onOpenChange(false);
        setIconSearch("");
      } else {
        form.setError("name", { message: response.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIconComponent =
    AVAILABLE_ICONS.find((i) => i.name === selectedIcon)?.icon ||
    AVAILABLE_ICONS[0].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection name and icon.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                placeholder="e.g. Work, Personal, Reading List"
                {...form.register("name")}
                autoFocus
              />
              {form.formState.errors.name && (
                <span className="text-destructive text-sm">
                  {form.formState.errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Icon</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-2 py-1 text-xs">
                  <SelectedIconComponent className="size-4" />
                  <span>{selectedIcon}</span>
                </div>
              </div>

              <Input
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="mb-2"
              />

              <div className="grid max-h-50 grid-cols-8 gap-2 overflow-y-auto rounded-md border bg-background/50 p-2">
                {filteredIcons.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    className={cn(
                      "flex items-center justify-center rounded-lg p-2 transition-all hover:scale-110 hover:bg-accent",
                      selectedIcon === name
                        ? "scale-105 bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                    title={name}
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
                {filteredIcons.length === 0 && (
                  <div className="col-span-8 py-8 text-center text-muted-foreground text-sm">
                    No icons found for "{iconSearch}"
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
