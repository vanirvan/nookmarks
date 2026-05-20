import useSWR from "swr";
import { getBookmarks } from "@/services/features/bookmarks/actions/bookmarks.actions";

export function useBookmarks(collectionId?: string | null) {
  return useSWR(
    collectionId !== undefined
      ? ["bookmarks", collectionId]
      : "bookmarks-all",
    async () => {
      const response = await getBookmarks({ collectionId });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  );
}
