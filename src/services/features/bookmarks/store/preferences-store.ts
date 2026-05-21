import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  includeNestedTagItems: boolean;
  displaySidebarTagItemCounts: boolean;
}

interface PreferencesActions {
  setIncludeNestedTagItems: (value: boolean) => void;
  setDisplaySidebarTagItemCounts: (value: boolean) => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      includeNestedTagItems: true,
      displaySidebarTagItemCounts: true,
      setIncludeNestedTagItems: (value) =>
        set({ includeNestedTagItems: value }),
      setDisplaySidebarTagItemCounts: (value) =>
        set({ displaySidebarTagItemCounts: value }),
    }),
    {
      name: "nookmarks-preferences",
    },
  ),
);
