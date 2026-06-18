import { create } from "zustand";
import { persist } from "zustand/middleware";
import useBankStore from "../contexts/bankStore";
import useCompanyStore from "./useCompanyStore";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => {
        const resetBankDetails = useBankStore.getState().resetBankDetails; // Access the resetBankDetails function
        resetBankDetails(); // Clear bank details store

        const clearCompanyInfo = useCompanyStore.getState().clearCompanyInfo;
        clearCompanyInfo();

        // Clear auth state and remove storage for auth-store
        set({ user: null, token: null });
        sessionStorage.removeItem("auth-store"); // Clear persisted auth state
      },
    }),
    {
      name: "auth-store", // Key for sessionStorage
      storage: {
        getItem: (key) => {
          const storedValue = sessionStorage.getItem(key);
          return storedValue ? JSON.parse(storedValue) : null;
        },
        setItem: (key, value) => {
          sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          sessionStorage.removeItem(key);
        },
      },
    }
  )
);

export default useAuthStore;
