"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { createCollectionSchema } from "@/lib/validations/collections";
import { createCollection } from "@/services/features/collections/actions/collections.actions";

type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>;

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
}: CreateCollectionDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>("Folder");
  const [iconSearch, setIconSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      icon: "Folder",
    },
  });

  const filteredIcons = AVAILABLE_ICONS.filter(({ name }) =>
    name.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const onSubmit = async (data: CreateCollectionFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await createCollection({
        name: data.name,
        icon: selectedIcon,
      });

      if (response.success) {
        // Revalidate collections cache
        mutate("collections");

        onOpenChange(false);
        form.reset();
        setSelectedIcon("Folder");
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
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new collection to organize your bookmarks.
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

              <div className="grid max-h-[200px] grid-cols-8 gap-2 overflow-y-auto rounded-md border bg-background/50 p-2">
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
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
