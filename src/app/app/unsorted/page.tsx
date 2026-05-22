import { Suspense } from "react";
import { BookmarkPage } from "@/components/features/bookmarks/bookmark-page";

export default function UnsortedPage() {
  return (
    <Suspense fallback={null}>
      <BookmarkPage
        title="Unsorted"
        description="Bookmarks that haven't been assigned to any collection."
        fallbackIconName="Inbox"
        collectionId={null}
      />
    </Suspense>
  );
}
