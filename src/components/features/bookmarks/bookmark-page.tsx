"use client";

import { useViewStore } from "@/services/features/bookmarks/store/view-store";
import { PageHeader } from "@/components/features/app/page-header";
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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        fallbackIconName={fallbackIconName}
        iconName={iconName}
      />
      <BookmarkList collectionId={collectionId} />
    </div>
  );
}
