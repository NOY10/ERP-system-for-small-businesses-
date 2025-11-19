import React, { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
const CardItem = ({ item, color, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 rounded shadow-md border-l-4 border-orange-400 relative bg-white">
      {/* Menu Button */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <CiMenuKebab
          className="cursor-pointer text-xl hover:text-gray-600"
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div className="bg-white shadow-lg rounded-md mt-1 p-1 absolute right-0 z-10">
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-blue-500"
              onClick={() => {
                onEdit(item);
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
              onClick={() => {
                onDelete(item._id);
                setShowMenu(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {/* Avatar and Content */}
      <div className="flex items-center gap-3">
        {/* Circular Avatar */}
        <div
          className={`w-16 h-16 flex items-center justify-center text-white font-bold text-3xl rounded-full ${color}`}
          style={{ backgroundColor: color }} // Ensure the color is applied
        >
          {item.initials}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-2">{item.title}</h2>
          <p className="text-normal">
            Amount: <span className="font-semibold">{item.amount}</span>
          </p>
          {item.date && (
            <p className="text-normal text-gray-500">{item.date}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardItem;