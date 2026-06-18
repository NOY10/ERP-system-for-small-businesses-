// store/useAppStore.js
import { create } from "zustand";

const useAppStore = create((set) => ({
  // Layout/UI States
  activeMenu: true,
  screenSize: window.innerWidth,
  themeSettings: false,
  currentMode: "Light",
  isClicked: {
    notification: false,
    userProfile: false,
  },

  // Socket & Notifications
  socket: null,
  notifications: [],

  // Actions
  setActiveMenu: (status) => set(() => ({ activeMenu: status })),
  toggleActiveMenu: () => set((state) => ({ activeMenu: !state.activeMenu })),
  setScreenSize: (size) => set(() => ({ screenSize: size })),
  setThemeSettings: (status) => set(() => ({ themeSettings: status })),
  setCurrentMode: (mode) => set(() => ({ currentMode: mode })),
  handleClick: (type) =>
    set((state) => ({
      isClicked: { ...state.isClicked, [type]: !state.isClicked[type] },
    })),

  // Socket Integration
  setSocket: (socketInstance) => set(() => ({ socket: socketInstance })),

  // Notification actions
  addNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),
  markNotificationRead: (index) =>
    set((state) => ({
      notifications: state.notifications.map((n, i) => (i === index ? { ...n, read: true } : n)),
    })),
  removeNotification: (index) =>
    set((state) => ({ notifications: state.notifications.filter((_, i) => i !== index) })),
}));

export default useAppStore;