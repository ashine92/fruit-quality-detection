import { create } from 'zustand';

export const useUIStore = create((set) => ({
  currentView: 'dashboard',
  confidenceFilter: 0,
  setView: (view) => set({ currentView: view }),
  setConfidenceFilter: (val) => set({ confidenceFilter: val }),
}));
