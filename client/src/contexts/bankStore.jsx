import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBankStore = create(
  persist(
    (set) => ({
      bankDetails: {
        accountName: "",
        accountNumber: "",
      },
      setBankDetails: (details) =>
        set((state) => ({
          bankDetails: {
            ...state.bankDetails,
            ...details,
          },
        })),
      resetBankDetails: () =>
        set({
          bankDetails: {
            accountName: "",
            accountNumber: "",
          },
        }),
    }),
    {
      name: "bank-details-storage",
      partialize: (state) => ({ bankDetails: state.bankDetails }),
    }
  )
);

export default useBankStore;
