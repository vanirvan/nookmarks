"use client";

import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateCollectionDialog } from "@/components/features/collections/create-collection-dialog";
import { EditCollectionDialog } from "@/components/features/collections/edit-collection-dialog";
import { DeleteCollectionDialog } from "@/components/features/collections/delete-collection-dialog";
import { Button } from "@/components/ui/button";
import { CollectionActionsDropdown } from "@/components/features/collections/collection-actions-dropdown";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCollectionIcon } from "@/lib/collection-icons";
import { useCollections } from "@/services/features/collections/hooks/use-collections";

export function NavCollections() {
  const { data: collections, isLoading } = useCollections();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{
    id: string;
    name: string;
    icon: string | null;
  } | null>(null);

  const handleEditClick = (collection: {
    id: string;
    name: string;
    icon: string | null;
  }) => {
    setSelectedCollection(collection);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (collection: {
    id: string;
    name: string;
    icon: string | null;
  }) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Collections</SidebarGroupLabel>
        <SidebarGroupAction onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4" /> <span className="sr-only">Add</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            {isLoading ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <Skeleton className="h-4 w-6 rounded-md" />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <Skeleton className="h-4 w-6 rounded-md" />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              </>
            ) : collections && collections.length > 0 ? (
              collections.map((collection) => {
                const Icon = getCollectionIcon(collection.icon);
                return (
                  <SidebarMenuItem key={collection.id}>
                    <SidebarMenuButton
                      render={
                        <Link href={`/app/collections/${collection.id}`} />
                      }
                    >
                      <Icon className="size-4" />
                      <span>{collection.name}</span>
                    </SidebarMenuButton>
                    <CollectionActionsDropdown
                      onEditClick={() =>
                        handleEditClick({
                          id: collection.id,
                          name: collection.name,
                          icon: collection.icon,
                        })
                      }
                      onDeleteClick={() =>
                        handleDeleteClick({
                          id: collection.id,
                          name: collection.name,
                          icon: collection.icon,
                        })
                      }
                    />
                    <SidebarMenuBadge>
                      {collection.bookmarkCount}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })
            ) : (
              <div className="px-2 py-1 text-muted-foreground text-sm">
                No collections yet
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      {selectedCollection && (
        <>
          <EditCollectionDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            collection={selectedCollection}
          />
          <DeleteCollectionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            collection={selectedCollection}
          />
        </>
      )}
    </>
  );
}
