import { create } from "zustand";

interface AuthUIState {
  isAuthenticating: boolean;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  isAuthenticating: false,
  setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
}));
