import { BookmarkPage } from "@/components/features/bookmarks/bookmark-page";

export default async function AppPage() {
  return (
    <BookmarkPage
      title="All Bookmarks"
      description="Viewing all of your saved bookmarks and images."
      fallbackIconName="LayoutDashboard"
    />
  );
}
