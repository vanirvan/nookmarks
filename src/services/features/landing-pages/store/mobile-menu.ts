import { create } from "zustand";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const useMobileMenuStore = create<MobileMenuProps>()((set) => ({
  open: false,
  onOpenChange: (open: boolean) => set({ open }),
}));
