import { Suspense } from "react";
import { BookmarkPage } from "@/components/features/bookmarks/bookmark-page";

export default async function AppPage() {
  return (
    <Suspense fallback={null}>
      <BookmarkPage
        title="All Bookmarks"
        description="Viewing all of your saved bookmarks and images."
        fallbackIconName="LayoutDashboard"
      />
    </Suspense>
  );
}
