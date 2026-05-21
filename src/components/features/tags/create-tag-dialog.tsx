"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { createNestedTags } from "@/services/features/tags/actions/tags.actions";
import { useTags } from "@/services/features/tags/hooks/use-tags";

const schema = z.object({
  path: z.string().min(1, "Tag path is required"),
});

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTagDialog({ open, onOpenChange }: CreateTagDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useTags();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      path: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const result = await createNestedTags(data);
      if (result.success) {
        toast.success("Tag created successfully");
        mutate();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Failed to create tag");
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
      <DialogContent className="sm:max-w-106.25 max-sm:h-full max-sm:max-w-full">
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path">Tag Path</Label>
            <Input
              id="path"
              placeholder="Work/Projects/Feature X"
              {...form.register("path")}
            />
            <p className="text-xs text-muted-foreground">
              Use "/" to create nested tags. Example: Work/Projects/Client A
            </p>
            {form.formState.errors.path && (
              <p className="text-xs text-destructive">
                {form.formState.errors.path.message}
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
              {isLoading ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
