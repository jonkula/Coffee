import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  searchText: '',
  activeColors: [],
  activeTags: [],
  dateRange: { from: '', to: '' },

  setSearch: (text) => set({ searchText: text }),

  toggleColor: (color) =>
    set((s) => ({
      activeColors: s.activeColors.includes(color)
        ? s.activeColors.filter((c) => c !== color)
        : [...s.activeColors, color],
    })),

  toggleTag: (tag) =>
    set((s) => ({
      activeTags: s.activeTags.includes(tag)
        ? s.activeTags.filter((t) => t !== tag)
        : [...s.activeTags, tag],
    })),

  setDateRange: (from, to) => set({ dateRange: { from, to } }),

  clearAll: () => set({ searchText: '', activeColors: [], activeTags: [], dateRange: { from: '', to: '' } }),
}));
