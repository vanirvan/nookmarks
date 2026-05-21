"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/features/app/page-header";
import { AddBookmarkDialog } from "@/components/features/bookmarks/add-bookmark-dialog";
import { BookmarkList } from "@/components/features/bookmarks/bookmark-list";

interface BookmarkPageProps {
  title: string;
  description: string;
  fallbackIconName: string;
  collectionId?: string | null;
  iconName?: string | null;
}

export function BookmarkPage({
  title,
  description,
  fallbackIconName,
  collectionId,
  iconName,
}: BookmarkPageProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("add-url")) {
      setAddDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        fallbackIconName={fallbackIconName}
        iconName={iconName}
        onAddClick={() => setAddDialogOpen(true)}
      />
      <BookmarkList collectionId={collectionId} />

      <AddBookmarkDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
