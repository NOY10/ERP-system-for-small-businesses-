import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LeaveCard = ({ item, onEdit, onDelete, onClose }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [borderColor, setBorderColor] = useState("");
  const navigate = useNavigate();

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
    setBorderColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const handleCardClick = () => {
    navigate("/LeaveRequestForm", {
      state: { leaveType: item.leaveType },
    });
  };

  return (
    <div
      className={`border p-4 py-6 rounded shadow-md border-l-4 ${borderColor} relative cursor-pointer`}
      onClick={handleCardClick}
    >
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
