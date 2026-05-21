import { create } from "zustand";

interface SelectionState {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: [],
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  selectAll: (ids) =>
    set((state) => {
      const allSelected = ids.every((id) => state.selectedIds.includes(id));
      if (allSelected) {
        // Deselect all these ids
        return {
          selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
        };
      } else {
        // Select all of these ids (avoid duplicates)
        const uniqueIds = Array.from(new Set([...state.selectedIds, ...ids]));
        return { selectedIds: uniqueIds };
      }
    }),
  clearSelection: () => set({ selectedIds: [] }),
}));
