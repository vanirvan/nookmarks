import useSWR from "swr";
import { getCollections } from "@/services/features/collections/actions/collections.actions";

export function useCollections() {
  return useSWR("collections", async () => {
    const response = await getCollections(null);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  });
}
