// Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import io from "socket.io-client";
import avatar from "./avatar.jpg";
import useAuthStore from "../store/useAuthStore";
import useAppStore from "../store/useAppStore"; // correct hook import
import NotificationCenter from "./Notification";
import UserProfile from "./UserProfile";

import { API_BASE_URL } from "../config/api";

const SOCKET_URL = import.meta.env.REACT_APP_SERVER_URL || `${API_BASE_URL}`;

const NavButton = ({ title, onClick, icon, dotColor }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="relative text-xl rounded-full p-3 hover:bg-navBg"
  >
    {dotColor && (
      <span
        style={{ background: dotColor }}
        className="absolute h-2 w-2 rounded-full right-2 top-2"
      />
    )}
    {icon}
  </button>
);

export default function Navbar() {
  // Zustand store hooks
  const activeMenu = useAppStore((state) => state.activeMenu);
  const setActiveMenu = useAppStore((state) => state.setActiveMenu);
  const handleClick = useAppStore((state) => state.handleClick);
  const isClicked = useAppStore((state) => state.isClicked);
  const screenSize = useAppStore((state) => state.screenSize);
  const setScreenSize = useAppStore((state) => state.setScreenSize);

  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Window resize listener
  useEffect(() => {
    const onResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [setScreenSize]);

  // Auto-toggle sidebar
  useEffect(() => {
    setActiveMenu(screenSize > 1323);
  }, [screenSize, setActiveMenu]);

  // Initialize socket for incoming notifications
  useEffect(() => {
    if (!user) return;
    socketRef.current = io(SOCKET_URL, { query: { role: user.role } });
    socketRef.current.on("receive_message", (data) => {
      if (data.sender !== user.name) {
        setNotifications((prev) => [...prev, { ...data, read: false }]);
      }
    });
    return () => socketRef.current.disconnect();
  }, [user]);

  // Toggle handlers
  const toggleMenu = () => setActiveMenu(!activeMenu);
  const toggleNotification = () => handleClick("notification");
  const toggleUserProfile = () => handleClick("userProfile");

  return (
    <div className="flex justify-between p-2 backdrop-blur-md bg-white/30 items-center">
      <NavButton
        title="Menu"
        onClick={toggleMenu}
        icon={<AiOutlineMenu className="text-primary" />}
      />
      <div className="flex items-center space-x-4">
        <Badge
          badgeContent={notifications.filter((n) => !n.read).length}
          color="error"
        >
          <NavButton
            title="Notifications"
            onClick={toggleNotification}
            icon={<NotificationsIcon className="text-primary" />}
            dotColor={isClicked.notification ? "#03C9D7" : undefined}
          />
        </Badge>

        <div
          onClick={toggleUserProfile}
          className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
        >
          <div
            className={`relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden`}
            style={{
              backgroundColor: "#e27396",
            }}
          >
            {/* user?.profilePic ? */}
            {user?.profilePic ? (
              <img
                src={`${user.profilePic}?v=${new Date().getTime()}`}
                alt="Profile"
                className="w-8 h-8 object-cover"
              />
            ) : (
              <span className="font-bold text-white text-sm uppercase">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <p>
            <span className="text-gray-400 text-14">Hi,</span>
            <span className="text-gray-400 font-bold ml-1 text-14">
              {user?.name || "Guest"}
            </span>
          </p>
          <MdKeyboardArrowDown className="text-gray-400 text-14" />
        </div>

        {isClicked.notification && (
          <NotificationCenter
            notifications={notifications}
            setNotifications={setNotifications}
            socketRef={socketRef}
            onClose={toggleNotification}
          />
        )}
        {isClicked.userProfile && <UserProfile />}
      </div>
    </div>
  );
}

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
