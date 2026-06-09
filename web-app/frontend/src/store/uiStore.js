import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      currentView: 'home',
      confidenceFilter: 0,
      isDarkMode: false,
      isSidebarCollapsed: false,
      setView: (view) => set({ currentView: view }),
      setConfidenceFilter: (val) => set({ confidenceFilter: val }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleDarkMode: () => set((state) => {
        const next = !state.isDarkMode;
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: next };
      }),
    }),
    {
      name: 'agrivision-ui',
    }
  )
);
