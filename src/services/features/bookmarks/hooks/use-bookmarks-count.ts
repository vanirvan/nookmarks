import useSWR from "swr";
import {
  getAllBookmarksCount,
  getUnsortedBookmarksCount,
  getUntaggedBookmarksCount,
} from "@/services/features/bookmarks/actions/bookmarks.actions";

export function useAllBookmarksCount() {
  return useSWR("all-bookmarks-count", async () => {
    const response = await getAllBookmarksCount(null);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  });
}

export function useUnsortedBookmarksCount() {
  return useSWR("unsorted-bookmarks-count", async () => {
    const response = await getUnsortedBookmarksCount(null);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  });
}

export function useUntaggedBookmarksCount() {
  return useSWR("untagged-bookmarks-count", async () => {
    const response = await getUntaggedBookmarksCount(null);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  });
}
