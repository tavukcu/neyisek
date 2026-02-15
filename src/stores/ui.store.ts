import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isLocationModalOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleLocationModal: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isLocationModalOpen: false,
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleLocationModal: () =>
    set((s) => ({ isLocationModalOpen: !s.isLocationModalOpen })),
  closeAll: () =>
    set({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
      isLocationModalOpen: false,
    }),
}));
