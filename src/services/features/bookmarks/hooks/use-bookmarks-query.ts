import {
  createSerializer,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

export const bookmarksSearchParams = {
  page: parseAsInteger.withDefault(1),
  "per-page": parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("createdAt"),
  order: parseAsString.withDefault("desc"),
  tag: parseAsString, // nullable string
};

export const bookmarksQuerySerializer = createSerializer(bookmarksSearchParams);

export function useBookmarksQuery() {
  return useQueryStates(bookmarksSearchParams, {
    clearOnDefault: true,
    shallow: true, // Performs shallow client-side navigation for lightning-fast state updates!
  });
}
