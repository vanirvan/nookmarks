"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Bookmark as BookmarkIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  checkDuplicateUrl,
  fetchUrlMetadata,
  updateBookmark,
} from "@/services/features/bookmarks/actions/bookmarks.actions";
import { useCollections } from "@/services/features/collections/hooks/use-collections";
import { useTags } from "@/services/features/tags/hooks/use-tags";
import { TagMultiSelect } from "./tag-multi-select";

const schema = z.object({
  id: z.uuid(),
  type: z.enum(["bookmark", "image"]),
  url: z.string().url().optional().nullable(),
  imagePath: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  tags: z.array(z.string()),
  collectionIds: z.array(z.string().uuid()),
  forceRefetchImage: z.boolean().optional(),
});

interface Bookmark {
  id: string;
  type: "bookmark" | "image" | null;
  url: string | null;
  imagePath: string | null;
  description: string | null;
  comments?: string | null;
  bookmarkTags?: Array<{
    tagId: string;
  }>;
  bookmarkCollections?: Array<{
    collectionId: string;
  }>;
}

interface EditBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: Bookmark;
}

export function EditBookmarkDialog({
  open,
  onOpenChange,
  bookmark,
}: EditBookmarkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicates, setDuplicates] = useState<Bookmark[]>([]);
  const [faviconError, setFaviconError] = useState(false);
  const { data: tags } = useTags();
  const { data: collections } = useCollections();
  const { mutate } = useSWRConfig();

  const triggerMutate = () => {
    mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
    mutate("all-bookmarks-count");
    mutate("unsorted-bookmarks-count");
    mutate("untagged-bookmarks-count");
    mutate("tag-item-counts");
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: bookmark.id,
      type: bookmark.type || "bookmark",
      url: bookmark.url || "",
      imagePath: bookmark.imagePath || "",
      description: bookmark.description || "",
      comments: bookmark.comments || "",
      tags: bookmark.bookmarkTags?.map((bt) => bt.tagId) || [],
      collectionIds:
        bookmark.bookmarkCollections?.map((bc) => bc.collectionId) || [],
      forceRefetchImage: false,
    },
  });

  useEffect(() => {
    form.reset({
      id: bookmark.id,
      type: bookmark.type || "bookmark",
      url: bookmark.url || "",
      imagePath: bookmark.imagePath || "",
      description: bookmark.description || "",
      comments: bookmark.comments || "",
      tags: bookmark.bookmarkTags?.map((bt) => bt.tagId) || [],
      collectionIds:
        bookmark.bookmarkCollections?.map((bc) => bc.collectionId) || [],
      forceRefetchImage: false,
    });
    setDuplicates([]);
    setFaviconError(false);
  }, [bookmark, form]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const subscription = form.watch((value, { name }) => {
      if (name === "url") {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const urlValue = value.url;
        if (urlValue && urlValue.length > 10) {
          timeoutId = setTimeout(async () => {
            setIsCheckingDuplicate(true);
            try {
              const result = await checkDuplicateUrl({
                url: urlValue,
                excludeId: bookmark.id,
              });
              if (result.success) {
                setDuplicates(result.data || []);
              }
            } catch (error) {
              console.error("Duplicate check error:", error);
            } finally {
              setIsCheckingDuplicate(false);
            }

            setIsFetchingMetadata(true);
            try {
              const result = await fetchUrlMetadata({ url: urlValue });
              if (result.success && result.data) {
                if (result.data.title && !form.getValues("description")) {
                  form.setValue("description", result.data.title);
                }
              }
            } catch (error) {
              console.error("Metadata fetch error:", error);
            } finally {
              setIsFetchingMetadata(false);
            }
          }, 800);
        } else {
          setDuplicates([]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [form, bookmark.id]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (duplicates.length > 0) {
      toast.error("Cannot save: duplicate URL detected");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateBookmark(data);
      if (result.success) {
        toast.success("Bookmark updated successfully");
        triggerMutate();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update bookmark");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const hasDuplicates = duplicates.length > 0;
  const urlValue = form.watch("url");

  let domain = "";
  try {
    if (urlValue) {
      domain = new URL(urlValue).hostname;
    }
  } catch {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {bookmark.type === "bookmark" && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="url">URL</Label>
                <div className="relative">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    {...form.register("url")}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isFetchingMetadata ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : domain ? (
                      !faviconError ? (
                        <Image
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                          alt=""
                          width={16}
                          height={16}
                          unoptimized
                          className="h-4 w-4"
                          onError={() => setFaviconError(true)}
                        />
                      ) : (
                        <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : null}
                  </div>
                </div>
                {form.formState.errors.url && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.url.message}
                  </p>
                )}
                {isCheckingDuplicate && (
                  <p className="text-xs text-muted-foreground">
                    Checking for duplicates...
                  </p>
                )}
              </div>

              {hasDuplicates && (
                <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">
                      Duplicate URL Detected
                    </p>
                    <p className="text-muted-foreground">
                      {duplicates.length} bookmark(s) with this URL already
                      exist. Cannot save.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Add a description..."
              {...form.register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comments">Personal Notes / Comments</Label>
            <Textarea
              id="comments"
              rows={3}
              placeholder="Add personal notes or comments..."
              {...form.register("comments")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <TagMultiSelect
              value={form.watch("tags")}
              onChange={(tags) => form.setValue("tags", tags)}
              availableTags={tags || []}
            />
            <p className="text-xs text-muted-foreground">
              Type to search or create new tags with &quot;/&quot;
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Collections</Label>
            <div className="flex flex-wrap gap-2">
              {collections?.map((collection) => {
                const isSelected = form
                  .watch("collectionIds")
                  .includes(collection.id);
                return (
                  <Badge
                    key={collection.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = form.getValues("collectionIds");
                      if (isSelected) {
                        form.setValue(
                          "collectionIds",
                          current.filter((id) => id !== collection.id),
                        );
                      } else {
                        form.setValue("collectionIds", [
                          ...current,
                          collection.id,
                        ]);
                      }
                    }}
                  >
                    {collection.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {bookmark.type === "bookmark" && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="forceRefetchImage"
                checked={form.watch("forceRefetchImage")}
                onCheckedChange={(checked) =>
                  form.setValue("forceRefetchImage", checked as boolean)
                }
              />
              <Label htmlFor="forceRefetchImage" className="cursor-pointer">
                Force refetch image (clears cache)
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || hasDuplicates}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
