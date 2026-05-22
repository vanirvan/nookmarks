import useSWR from "swr";
import { getBookmarks } from "@/services/features/bookmarks/actions/bookmarks.actions";
import { usePreferencesStore } from "@/services/features/bookmarks/store/preferences-store";
import { useBookmarksQuery } from "./use-bookmarks-query";

export function useBookmarks(collectionId?: string | null) {
  const [queryState] = useBookmarksQuery();
  const { includeNestedTagItems } = usePreferencesStore();

  const {
    page,
    "per-page": limit,
    search: searchRaw,
    sort: sortRaw,
    order: orderRaw,
    tag: tagParam,
  } = queryState;

  const search = searchRaw || undefined;
  const sort = (sortRaw as "createdAt" | "title" | "url") || undefined;
  const order = (orderRaw as "asc" | "desc") || undefined;

  const tagId =
    tagParam === null ? undefined : tagParam === "untagged" ? null : tagParam;

  return useSWR(
    [
      "bookmarks",
      collectionId,
      tagId,
      includeNestedTagItems,
      page,
      limit,
      search,
      sort,
      order,
    ],
    async () => {
      const response = await getBookmarks({
        collectionId,
        tagId,
        includeNestedTags: includeNestedTagItems,
        search,
        sort,
        order,
        page,
        limit,
      });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    {
      refreshInterval: (data) => {
        const hasPending = data?.bookmarks?.some((b) => b.aiStatus === "pending") ?? false;
        return hasPending ? 3000 : 0;
      },
    }
  );
}
