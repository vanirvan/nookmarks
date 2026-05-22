"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function AddBookmarkQueryTrigger({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("add-url")) {
      setOpen(true);
    }
  }, [searchParams, setOpen]);

  return null;
}

export function BookmarkPage({
  title,
  description,
  fallbackIconName,
  collectionId,
  iconName,
}: BookmarkPageProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <AddBookmarkQueryTrigger setOpen={setAddDialogOpen} />
      </Suspense>

      <PageHeader
        title={title}
        description={description}
        fallbackIconName={fallbackIconName}
        iconName={iconName}
        onAddClick={() => setAddDialogOpen(true)}
      />
      <Suspense fallback={null}>
        <BookmarkList collectionId={collectionId} />
      </Suspense>

      <AddBookmarkDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
