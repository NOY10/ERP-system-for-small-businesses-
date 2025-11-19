// store/useCompanyStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCompanyStore = create(
  persist(
    (set) => ({
      companyInfo: null,

      setCompanyInfo: (info) => set({ companyInfo: info }),

      clearCompanyInfo: () => {
        set({ companyInfo: null });
        sessionStorage.removeItem("company-storage");
      },
    }),
    {
      name: "company-storage", // unique key for sessionStorage
      storage: {
        getItem: async (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

export default useCompanyStore;
