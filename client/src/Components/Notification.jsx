// NotificationCenter.jsx
import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { MdOutlineCancel, MdDone, MdDelete, MdSend } from "react-icons/md";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useAuthStore from "../store/useAuthStore";

const NotificationCenter = ({ notifications, setNotifications, socketRef, onClose }) => {
  const { user } = useAuthStore();
  const notificationRef = useRef(null);

  const handleBackdropClick = () => onClose();
  const stopPropagation = (e) => e.stopPropagation();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsDone = (i) => setNotifications((prev) => prev.map((n, idx) => (idx === i ? { ...n, read: true } : n)));
  const removeNotification = (i) => setNotifications((prev) => prev.filter((_, idx) => idx !== i));

  const sendMessage = () => {
    const input = document.getElementById("notification-input");
    const content = input?.value.trim();
    if (!content || !socketRef.current) return;
    const newMsg = { sender: user.name, message: content, date: new Date().toLocaleString(), read: false };
    socketRef.current.emit("send_message", newMsg);
    input.value = "";
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-start justify-end p-5" onClick={handleBackdropClick}>
      <div ref={notificationRef} onClick={stopPropagation} className="bg-white p-6 rounded-2xl w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <NotificationsIcon fontSize="large" className="text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" />}
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <MdOutlineCancel size={24} />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <div key={i} className="flex justify-between items-center p-3 mb-3 bg-gray-50 rounded-lg">
                <div>
                  <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-blue-600'}`}>{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                </div>
                <div className="flex space-x-2">
                  {!n.read && (
                    <button type="button" onClick={() => markAsDone(i)} title="Mark as Done" className="p-1 rounded-full hover:bg-green-100">
                      <MdDone size={18} />
                    </button>
                  )}
                  <button type="button" onClick={() => removeNotification(i)} title="Delete" className="p-1 rounded-full hover:bg-red-100">
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No notifications available.</p>
          )}
        </div>
        {['Owner', 'Accountant', 'HR'].includes(user?.role) && (
          <div className="mt-4 flex">
            <input id="notification-input" type="text" placeholder="Type a message" className="flex-grow border rounded-l-lg p-2 focus:outline-none" />
            <button type="button" onClick={sendMessage} className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg">
              <MdSend size={20} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NotificationCenter;