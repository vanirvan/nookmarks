import useSWR from "swr";
import { getTagItemCounts } from "@/services/features/tags/actions/tags.actions";

export function useTagItemCounts() {
  return useSWR("tag-item-counts", async () => {
    const response = await getTagItemCounts(null);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  });
}
