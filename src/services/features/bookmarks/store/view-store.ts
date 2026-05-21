import { create } from "zustand";

interface ViewState {
  view: "grid" | "list" | "table";
  setView: (view: "grid" | "list" | "table") => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: "newest" | "oldest" | "a-z" | "z-a";
  setSortBy: (sortBy: "newest" | "oldest" | "a-z" | "z-a") => void;
  tagFilter: string | null | "untagged";
  setTagFilter: (tagFilter: string | null | "untagged") => void;
}

export const useViewStore = create<ViewState>((set) => ({
  view: "grid",
  setView: (view) => set({ view }),
  search: "",
  setSearch: (search) => set({ search }),
  sortBy: "newest",
  setSortBy: (sortBy) => set({ sortBy }),
  tagFilter: null,
  setTagFilter: (tagFilter) => set({ tagFilter }),
}));
