"use client";

import {
  ExternalLink,
  Loader2,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFileUrl } from "@/lib/server/s3.server";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/services/features/bookmarks/store/selection-store";
import { DeleteBookmarkDialog } from "./delete-bookmark-dialog";
import { EditBookmarkDialog } from "./edit-bookmark-dialog";
import { ImageDialog } from "./image-dialog";

type BookmarkTag = {
  bookmarkId: string;
  tagId: string;
  tag: {
    id: string;
    title: string;
    color: string;
  };
};

type Bookmark = {
  id: string;
  userId: string;
  type: "bookmark" | "image" | null;
  url: string | null;
  imagePath: string | null;
  description: string | null;
  title?: string | null;
  aiStatus: string | null;
  aiError: string | null;
  aiMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  bookmarkTags: BookmarkTag[];
  bookmarkCollections: Array<{
    bookmarkId: string;
    collectionId: string;
    collection: {
      id: string;
      name: string;
    };
  }>;
};

interface BookmarkCardProps {
  bookmark: Bookmark;
  view: "grid" | "list";
}

export function BookmarkCard({ bookmark, view }: BookmarkCardProps) {
  const { selectedIds, toggleSelection } = useSelectionStore();
  const isSelected = selectedIds.includes(bookmark.id);
  const isSelectMode = selectedIds.length > 0;
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const isImage = bookmark.type === "image";
  const imageUrl =
    isImage && bookmark.imagePath ? getFileUrl(bookmark.imagePath) : null;
  const tags = bookmark.bookmarkTags || [];
  const metadata = (bookmark.aiMetadata || {}) as Record<string, string>;
  const title =
    metadata.extractedTitle || bookmark.description || bookmark.url || "";
  const description =
    metadata.extractedDescription || bookmark.description || "";
  const favicon = metadata.favicon || "";
  const ogImage = metadata.ogImage || "";
  const isLoadingMetadata = bookmark.aiStatus === "pending";

  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname;
    }
  } catch {}

  if (view === "list") {
    return (
      <div
        className={cn(
          "group relative flex items-center gap-4 p-3 rounded-xl border hover:bg-accent/50 transition-all duration-200 h-20",
          isSelected
            ? "border-primary/50 bg-primary/5 shadow-xs"
            : "bg-card border-border",
        )}
      >
        {/* Multi-Select Checkbox */}
        <div
          className={cn(
            "shrink-0 flex items-center transition-all duration-200",
            isSelectMode
              ? "w-6 opacity-100"
              : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100 overflow-hidden",
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelection(bookmark.id)}
          />
        </div>
        {isLoadingMetadata && (
          <div className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background/85 backdrop-blur-xs border shadow-xs">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        )}
        {isImage ? (
          <button
            type="button"
            className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 cursor-zoom-in relative text-left"
            onClick={() => setImageDialogOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setImageDialogOpen(true);
              }
            }}
          >
            <Image
              src={imageUrl ?? ""}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ) : ogImage ? (
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
            <Image
              src={ogImage}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden border">
            {favicon && !faviconError ? (
              <Image
                src={favicon}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : domain && !faviconError ? (
              <Image
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <ExternalLink className="h-5 w-5 text-primary" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate leading-none">{title}</h3>
            {tags.length > 0 && (
              <div className="flex gap-1 overflow-hidden shrink-0">
                {tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.tag.id}
                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border shrink-0"
                  >
                    {tag.tag.title}
                  </span>
                ))}
                {tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    +{tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {bookmark.url || "Image Bookmark"}
          </p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isImage && (
          <ImageDialog
            open={imageDialogOpen}
            onOpenChange={setImageDialogOpen}
            src={imageUrl ?? ""}
          />
        )}

        <EditBookmarkDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          bookmark={bookmark}
        />

        <DeleteBookmarkDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          bookmark={bookmark}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative grid grid-rows-subgrid rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 row-span-4",
        isSelected
          ? "border-primary/50 ring-1 ring-primary/20 bg-primary/5 shadow-sm"
          : "bg-card border-border",
      )}
    >
      {/* Floating Checkbox for Grid Cards */}
      <div
        className={cn(
          "absolute top-2 left-2 z-20 transition-all duration-200",
          isSelectMode || isSelected
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
        )}
      >
        <div className="bg-background/90 backdrop-blur-xs border shadow-xs rounded-md p-1.5 flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelection(bookmark.id)}
          />
        </div>
      </div>
      {isLoadingMetadata && (
        <div className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background/85 backdrop-blur-xs border shadow-xs">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </div>
      )}
      <div className="relative">
        {isImage ? (
          <button
            type="button"
            className="aspect-4/3 bg-muted relative cursor-zoom-in overflow-hidden w-full text-left"
            onClick={() => setImageDialogOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setImageDialogOpen(true);
              }
            }}
          >
            <Image
              src={imageUrl ?? ""}
              alt=""
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ) : ogImage ? (
          <div className="aspect-4/3 bg-muted relative overflow-hidden border-b">
            <Image
              src={ogImage}
              alt=""
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {bookmark.url && (
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              >
                <span className="sr-only">Open {title} in a new tab</span>
              </a>
            )}
          </div>
        ) : (
          <div className="aspect-4/3 bg-primary/5 flex items-center justify-center relative overflow-hidden border-b">
            {favicon && !faviconError ? (
              <div className="h-16 w-16 rounded-2xl bg-background border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={favicon}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 object-contain"
                  onError={() => setFaviconError(true)}
                />
              </div>
            ) : domain && !faviconError ? (
              <div className="h-16 w-16 rounded-2xl bg-background border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 object-contain"
                  onError={() => setFaviconError(true)}
                />
              </div>
            ) : (
              <ExternalLink className="h-10 w-10 text-primary/20 transition-transform duration-300 group-hover:scale-110" />
            )}
            {bookmark.url && (
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
              >
                <span className="sr-only">Open {title} in a new tab</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
      </div>

      <div className="px-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description || "Image Bookmark"}
        </p>
      </div>

      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.tag.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border"
              >
                {tag.tag.title}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0" />
            }
          >
            <MoreHorizontal className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isImage && (
        <ImageDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          src={imageUrl ?? ""}
        />
      )}

      <EditBookmarkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        bookmark={bookmark}
      />

      <DeleteBookmarkDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bookmark={bookmark}
      />
    </div>
  );
}
