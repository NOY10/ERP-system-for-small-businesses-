import React, { useState, useEffect } from "react";
import { CiMenuKebab } from "react-icons/ci";

const LeaveCard = ({ item, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [borderColor, setBorderColor] = useState("");

  useEffect(() => {
    const colors = [
      "border-red-400",
      "border-blue-400",
      "border-green-400",
      "border-purple-400",
      "border-yellow-400",
      "border-pink-400",
      "border-indigo-400",
      "border-teal-400",
      "border-gray-400",
      "border-orange-400",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBorderColor(randomColor);
  }, []);

  return (
    <div
      className={`border p-4 py-6 rounded shadow-md border-l-4 ${borderColor} relative`}
    >
      {/* Menu Button */}
      <div className="absolute top-2 right-2">
        <CiMenuKebab
          className="cursor-pointer text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="bg-white shadow-lg rounded-md mt-1 p-1 absolute right-0 w-32">
            <button
              className="text-normal text-blue-500 p-2 block w-full text-left hover:bg-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit(item);
              }}
            >
              Edit
            </button>
            <button
              className="text-normal text-red-500 p-2 block w-full text-left hover:bg-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(item._id);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Leave Card Content */}
      <div className="flex items-center gap-3 relative">
        <div
          className={`w-16 h-16 flex items-center justify-center text-white font-bold text-3xl rounded-full ${item.color} absolute top-2`}
        >
          {item.leaveType
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("")}
        </div>
        <h2 className="text-lg font-bold pl-20 mb-2">{item.leaveType}</h2>
      </div>

      <p className="text-lg pl-20">
        Payment: <span className="font-semibold">{item.payment}</span>
      </p>
      <p className="text-lg pl-20">
        Number of Days: <span className="font-semibold">{item.days}</span>
      </p>
    </div>
  );
};

export default LeaveCard;
