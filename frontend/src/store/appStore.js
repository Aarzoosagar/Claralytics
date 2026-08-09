import { create } from 'zustand'

const ACTIVE_DATASET_KEY = 'claralytics_active_dataset'

export const useAppStore = create((set) => ({
  activeDatasetId:
  Number(
    localStorage.getItem(
      ACTIVE_DATASET_KEY
    )
  ) || null,
  datasets: [],
  sidebarCollapsed: false,

  setActiveDataset: (id) => {
    if (id) {
      localStorage.setItem(ACTIVE_DATASET_KEY, String(id))
    } else {
      localStorage.removeItem(ACTIVE_DATASET_KEY)
    }
    set({ activeDatasetId: id })
  },

  setDatasets: (datasets) => set({ datasets }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
