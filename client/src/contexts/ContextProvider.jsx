// src/contexts/ContextProvider.jsx
import React, { createContext, useContext, useEffect } from "react";
import io from "socket.io-client";
import useAppStore from "../store/useAppStore";
import useAuthStore from "../store/useAuthStore";

const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const setSocket = useAppStore((state) => state.setSocket);
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    if (!user) return;
    const socket = io(process.env.REACT_APP_SERVER_URL, {
      query: { role: user.role },
    });
    setSocket(socket);

    socket.on("receive_message", (data) => {
      addNotification({ message: data.message, date: data.date });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setSocket, addNotification]);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

// alias if you prefer AppProvider elsewhere
export const AppProvider = ContextProvider;

export const useAppContext = () => useContext(AppContext);
