
// UserProfile.jsx
import React, { useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { MdOutlineCancel } from "react-icons/md";
import useAppStore from "../store/useAppStore";
import useAuthStore from "../store/useAuthStore";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, logout } = useAuthStore();
  const handleClick = useAppStore((state) => state.handleClick);
  const isClicked = useAppStore((state) => state.isClicked.userProfile);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const closeProfile = useCallback(() => {
    handleClick("userProfile");
  }, [handleClick]);

  const handleOutsideClick = useCallback(
    (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        closeProfile();
      }
    },
    [closeProfile]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  if (!isClicked) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-5 bg-black bg-opacity-25"
    >
      <div
        ref={containerRef}
        className="bg-white p-6 rounded-2xl w-96 shadow-xl relative"
      >
        <button
          type="button"
          onClick={closeProfile}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
        >
          <MdOutlineCancel size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="flex gap-5 items-center mb-4">
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: "#e27396" }}
          >
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-white text-2xl uppercase">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-xl">{user?.name || "Guest"}</p>
            <p className="text-gray-500 text-sm">{user?.role}</p>
            <p className="text-gray-500 text-sm font-semibold">{user?.email}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            color="white"
            bgColor="#408dfb"
            text="Logout"
            borderRadius="10px"
            width="full"
            paddingX={4}
            paddingY={2}
            onClick={() => {
              logout();
              closeProfile();
            }}
          />
          <button
            className="text-black bg-white rounded-[10px] px-4 py-2 border border-gray-300 hover:bg-gray-100 transition"
            onClick={() => {
              if (user.role === "Owner") {
                navigate("/Setting");
              } else {
                navigate("/SettingEmp");
              }
              closeProfile();
            }}
          >
            Setting
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default UserProfile;
