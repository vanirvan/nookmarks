import useSWR from "swr";
import { getTags } from "../actions/tags.actions";

export function useTags() {
  return useSWR("tags", async () => {
    const result = await getTags(null);
    if (!result.success) throw new Error(result.error);
    return result.data;
  });
}
