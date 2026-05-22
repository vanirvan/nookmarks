"use client";

import { Suspense, use } from "react";
import { BookmarkPage } from "@/components/features/bookmarks/bookmark-page";
import { useCollections } from "@/services/features/collections/hooks/use-collections";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: collections } = useCollections();
  const collection = collections?.find((c) => c.id === id);

  return (
    <Suspense fallback={null}>
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
    </Suspense>
  );
}
