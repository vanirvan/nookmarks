"use client";

import {
  ExternalLink,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFileUrl } from "@/lib/server/s3.server";
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
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const isImage = bookmark.type === "image";
  const imageUrl =
    isImage && bookmark.imagePath ? getFileUrl(bookmark.imagePath) : null;
  const tags = bookmark.bookmarkTags || [];

  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname;
    }
  } catch {}

  if (view === "list") {
    return (
      <div className="group relative flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors h-20">
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
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden border">
            {domain && !faviconError ? (
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
            <h3 className="font-medium truncate leading-none">
              {bookmark.description || bookmark.url}
            </h3>
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
      </div>
    );
  }

  return (
    <div className="group relative grid grid-rows-subgrid rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all row-span-4">
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
        ) : (
          <div className="aspect-4/3 bg-primary/5 flex items-center justify-center relative overflow-hidden border-b">
            {domain && !faviconError ? (
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
                <span className="sr-only">
                  Open {bookmark.title || bookmark.description || bookmark.url}{" "}
                  in a new tab
                </span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">
          {bookmark.title || bookmark.description || bookmark.url}
        </h3>
      </div>

      <div className="px-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {bookmark.description || bookmark.url || "Image Bookmark"}
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
    </div>
  );
}
