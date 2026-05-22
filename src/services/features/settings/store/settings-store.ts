import { create } from "zustand";

interface SettingsState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  openSettings: () => set({ isOpen: true }),
  closeSettings: () => set({ isOpen: false }),
}));
