import { create } from "zustand";

interface ViewState {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: "newest" | "oldest" | "a-z" | "z-a";
  setSortBy: (sortBy: "newest" | "oldest" | "a-z" | "z-a") => void;
}

export const useViewStore = create<ViewState>((set) => ({
  view: "grid",
  setView: (view) => set({ view }),
  search: "",
  setSearch: (search) => set({ search }),
  sortBy: "newest",
  setSortBy: (sortBy) => set({ sortBy }),
}));
