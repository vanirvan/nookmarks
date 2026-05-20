"use client";

import { useCollections } from "@/services/features/collections/hooks/use-collections";
import { BookmarkPage } from "@/components/features/bookmarks/bookmark-page";
import { use } from "react";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: collections } = useCollections();
  const collection = collections?.find((c) => c.id === id);

  return (
    <BookmarkPage
      title={collection?.name ?? "Collection"}
      description={
        collection
          ? `Viewing bookmarks in ${collection.name}.`
          : "Viewing bookmarks in this collection."
      }
      iconName={collection?.icon}
      fallbackIconName="Folder"
      collectionId={id}
    />
  );
}
