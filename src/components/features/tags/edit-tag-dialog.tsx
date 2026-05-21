"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTag } from "@/services/features/tags/actions/tags.actions";
import { useTags } from "@/services/features/tags/hooks/use-tags";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  parent: z.preprocess(
    (val) => (val === "" ? null : val),
    z.uuid().nullable().optional(),
  ),
});

interface EditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: {
    id: string;
    title: string;
    parent: string | null;
  };
}

export function EditTagDialog({ open, onOpenChange, tag }: EditTagDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: allTags, mutate } = useTags();
  const { mutate: globalMutate } = useSWRConfig();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: tag.title,
      parent: tag.parent,
    },
  });

  useEffect(() => {
    form.reset({
      title: tag.title,
      parent: tag.parent,
    });
  }, [tag, form]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const result = await updateTag({
        tagId: tag.id,
        ...data,
      });
      if (result.success) {
        toast.success("Tag updated successfully");
        mutate();
        globalMutate((key) => Array.isArray(key) && key[0] === "bookmarks");
        globalMutate("tag-item-counts");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update tag");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableParents = allTags?.filter((t) => t.id !== tag.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 max-sm:h-full max-sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Tag (optional)</Label>
            <select
              id="parent"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              {...form.register("parent")}
            >
              <option value="">None (Root Level)</option>
              {availableParents.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullPath}
                </option>
              ))}
            </select>
            {form.formState.errors.parent && (
              <p className="text-xs text-destructive">
                {form.formState.errors.parent.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
