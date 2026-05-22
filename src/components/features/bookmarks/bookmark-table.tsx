"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Settings2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useBookmarksQuery } from "@/services/features/bookmarks/hooks/use-bookmarks-query";
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
  comments?: string | null;
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

interface BookmarkTableProps {
  bookmarks: Bookmark[];
}

function BookmarkImageCell({ bookmark }: { bookmark: Bookmark }) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const isImage = bookmark.type === "image";
  const imageUrl = isImage && bookmark.imagePath ? bookmark.imagePath : null;
  const metadata = (bookmark.aiMetadata || {}) as Record<string, string>;
  const favicon = metadata.favicon || "";
  const ogImage = metadata.ogImage || "";

  let domain = "";
  try {
    if (bookmark.url) {
      domain = new URL(bookmark.url).hostname;
    }
  } catch {}

  return (
    <div className="flex items-center shrink-0">
      {isImage ? (
        <button
          type="button"
          className="h-10 w-10 rounded-lg overflow-hidden bg-muted relative cursor-zoom-in text-left border hover:scale-105 transition-transform"
          onClick={() => setImageDialogOpen(true)}
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
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted relative border">
          <Image
            src={ogImage}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center overflow-hidden border">
          {favicon && !faviconError ? (
            <Image
              src={favicon}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : domain && !faviconError ? (
            <Image
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <ExternalLink className="h-4 w-4 text-primary/40" />
          )}
        </div>
      )}

      {isImage && (
        <ImageDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          src={imageUrl ?? ""}
        />
      )}
    </div>
  );
}

function BookmarkActionsCell({ bookmark }: { bookmark: Bookmark }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 p-0 flex items-center justify-center"
            />
          }
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setEditDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="text-destructive focus:text-destructive flex items-center gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

export function BookmarkTable({ bookmarks }: BookmarkTableProps) {
  const { selectedIds, toggleSelection, setSelectedIds } = useSelectionStore();
  const [queryState, setQueryState] = useBookmarksQuery();

  const sortVal = queryState.sort;
  const orderVal = queryState.order;

  const handleSort = useCallback(
    (field: "createdAt" | "title" | "url") => {
      let nextOrder: "asc" | "desc" = "desc";
      if (sortVal === field) {
        nextOrder = orderVal === "desc" ? "asc" : "desc";
      } else {
        nextOrder = field === "title" || field === "url" ? "asc" : "desc";
      }

      setQueryState({
        sort: field,
        order: nextOrder,
        page: 1,
      });
    },
    [sortVal, orderVal, setQueryState],
  );

  const getSortIcon = useCallback(
    (field: "createdAt" | "title" | "url") => {
      if (sortVal !== field) {
        return <ArrowUpDown className="h-3 w-3 opacity-50" />;
      }
      return (
        <ArrowUpDown
          className={cn(
            "h-3 w-3 text-primary transition-transform duration-200",
            orderVal === "asc" ? "rotate-180" : "",
          )}
        />
      );
    },
    [sortVal, orderVal],
  );

  // Load column visibility from localStorage if exists
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("bookmark-table-columns");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {}
        }
      }
      return {
        image: true,
        title: true,
        url: true,
        tags: true,
        description: false,
        comments: false,
        createdAt: true,
      };
    },
  );

  // Persist column visibility when changed
  useEffect(() => {
    localStorage.setItem(
      "bookmark-table-columns",
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  const columns = useMemo<ColumnDef<Bookmark>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const currentPageRows = table
            .getRowModel()
            .rows.map((r) => r.original.id);
          const allSelected =
            currentPageRows.length > 0 &&
            currentPageRows.every((id) => selectedIds.includes(id));
          const someSelected =
            !allSelected &&
            currentPageRows.some((id) => selectedIds.includes(id));

          return (
            <div className="flex items-center justify-center p-1">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    // Union of current selection and page rows
                    const newSelection = Array.from(
                      new Set([...selectedIds, ...currentPageRows]),
                    );
                    setSelectedIds(newSelection);
                  } else {
                    // Remove page rows from selection
                    const pageRowsSet = new Set(currentPageRows);
                    const newSelection = selectedIds.filter(
                      (id) => !pageRowsSet.has(id),
                    );
                    setSelectedIds(newSelection);
                  }
                }}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const isSelected = selectedIds.includes(row.original.id);
          return (
            <div className="flex items-center justify-center p-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelection(row.original.id)}
              />
            </div>
          );
        },
        enableHiding: false,
      },
      {
        id: "image",
        header: "Preview",
        cell: ({ row }) => <BookmarkImageCell bookmark={row.original} />,
      },
      {
        accessorKey: "title",
        header: () => (
          <Button
            variant="ghost"
            size="sm"
            className="px-1 gap-1 text-xs hover:bg-muted/50"
            onClick={() => handleSort("title")}
          >
            Title
            {getSortIcon("title")}
          </Button>
        ),
        cell: ({ row }) => {
          const bookmark = row.original;
          const metadata = (bookmark.aiMetadata || {}) as Record<
            string,
            string
          >;
          const title =
            bookmark.description ||
            metadata.extractedTitle ||
            bookmark.url ||
            "";
          const isLoadingMetadata = bookmark.aiStatus === "pending";

          return (
            <div className="flex items-center gap-2 max-w-[240px] lg:max-w-[320px]">
              {isLoadingMetadata && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              )}
              {bookmark.url ? (
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors hover:underline truncate"
                >
                  {title}
                </a>
              ) : (
                <span className="font-medium text-foreground truncate">
                  {title}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "url",
        header: () => (
          <Button
            variant="ghost"
            size="sm"
            className="px-1 gap-1 text-xs hover:bg-muted/50"
            onClick={() => handleSort("url")}
          >
            URL
            {getSortIcon("url")}
          </Button>
        ),
        cell: ({ row }) => {
          const url = row.original.url;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[180px]"
            >
              {url}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Image File
            </span>
          );
        },
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.original.bookmarkTags || [];
          if (tags.length === 0)
            return <span className="text-xs text-muted-foreground/50">—</span>;

          return (
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {tags.slice(0, 2).map((bt) => (
                <span
                  key={bt.tag.id}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border shrink-0"
                >
                  {bt.tag.title}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border shrink-0">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const bookmark = row.original;
          const metadata = (bookmark.aiMetadata || {}) as Record<
            string,
            string
          >;
          const description =
            metadata.customDescription ||
            metadata.aiSummary ||
            metadata.extractedDescription ||
            "";
          return description ? (
            <span className="text-xs text-muted-foreground line-clamp-2 max-w-[280px] break-all">
              {description}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/45 italic">
              No description
            </span>
          );
        },
      },
      {
        accessorKey: "comments",
        header: "Comments",
        cell: ({ row }) => {
          const comments = row.original.comments || "";
          return comments ? (
            <span className="text-xs text-foreground font-medium line-clamp-2 max-w-[280px] bg-yellow-500/10 dark:bg-yellow-500/5 border border-yellow-500/20 px-2.5 py-1 rounded-lg block break-all">
              {comments}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/35 italic">
              No comments
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <Button
            variant="ghost"
            size="sm"
            className="px-1 gap-1 text-xs hover:bg-muted/50"
            onClick={() => handleSort("createdAt")}
          >
            Created
            {getSortIcon("createdAt")}
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => <BookmarkActionsCell bookmark={row.original} />,
        enableHiding: false,
      },
    ],
    [selectedIds, toggleSelection, setSelectedIds, handleSort, getSortIcon],
  );

  const table = useReactTable({
    data: bookmarks,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Table controls */}
      <div className="flex justify-end items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Columns</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  <span className="capitalize">{column.id}</span>
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Table wrapper */}
      <div className="rounded-xl border bg-card/45 backdrop-blur-xs overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-xs py-2.5"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    selectedIds.includes(row.original.id) && "selected"
                  }
                  className="group/row transition-all duration-150 hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground/80"
                >
                  No bookmarks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
