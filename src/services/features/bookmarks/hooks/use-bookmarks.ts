import useSWR from "swr";
import { getBookmarks } from "@/services/features/bookmarks/actions/bookmarks.actions";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";
import { usePreferencesStore } from "@/services/features/bookmarks/store/preferences-store";

export function useBookmarks(collectionId?: string | null) {
  const { tagFilter } = useViewStore();
  const { includeNestedTagItems } = usePreferencesStore();

  return useSWR(
    [
      "bookmarks",
      collectionId ?? null,
      tagFilter,
      includeNestedTagItems,
    ],
    async () => {
      const response = await getBookmarks({
        collectionId,
        tagId: tagFilter === "untagged" ? null : tagFilter,
        includeNestedTags: includeNestedTagItems,
      });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  );
}
