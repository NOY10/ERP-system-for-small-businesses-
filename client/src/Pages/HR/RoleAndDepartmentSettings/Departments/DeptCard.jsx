import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaPencilAlt, FaTrash } from "react-icons/fa";
import AddDepartmentForm from "./AddDepartmentForm";
import Toast from "../../../../Components/Toast";
import useAuthStore from "../../../../store/useAuthStore";
import DialogBox from "../../../../Components/Dialogbox";

const pastelColors = [
  "#f07167",
  "#335c67",
  "#7f5539",
  "#f28482",
  "#f5cac3",
  "#6b705c",
  "#cb997e",
  "#9d6b53",
  "#c9cba3",
  "#eae0d5",
  "#b392ac",
  "#735d78",
  "#e27396",
  "#f29559",
  "#acd8aa",
];

const getRandomColor = (() => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      colorMap.set(
        id,
        pastelColors[Math.floor(Math.random() * pastelColors.length)]
      );
    }
    return colorMap.get(id);
  };
})();

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
const DeptCard = ({ index, dept, onEditDept, handleDeleteDept }) => {
  const { token } = useAuthStore();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [error, setError] = useState(null);

  const optionsRef = useRef(null);

  // Function to close the options when clicking outside
  const handleClickOutside = (e) => {
    if (optionsRef.current && !optionsRef.current.contains(e.target)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    // Add event listener on mount and remove on unmount
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDeleteConfirm = async () => {
    setShowOptions(false);
    try {
      const response = await fetch(
        `http://localhost:8000/deleteDept/${dept._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        handleDeleteDept(dept._id);
      } else {
        setError("Failed to delete dept");
      }
    } catch (error) {
      setError("Error deleting dept");
    }
  };

  return (
    <div
      className="p-5 border bg-white shadow-xs hover:shadow-md transition-all duration-200 h-40 w-96 flex items-center relative"
      tabIndex={0}
    >
      {/* Toast Messages */}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* dept Avatar */}
      <div
        className="w-20 h-20 flex items-center justify-center border-2 border-white rounded-full transform hover:scale-150 transition-transform duration-200 z-10"
        style={{ backgroundColor: getRandomColor(index) }}
      >
        <span className="font-bold text-gray-700 text-xl uppercase">
          {getInitials(dept.deptName)}
        </span>
      </div>

      {/* dept Details */}
      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">
          {dept.deptName.replace(/\b\w/g, (char) => char.toUpperCase())}
        </h3>

        <p className="text-xs text-gray-500">Created by: {dept.createdBy}</p>
      </div>

      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-2 text-lg"
        >
          <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
        </button>

        {/* Dropdown menu */}
        {showOptions && (
          <div
            ref={optionsRef}
            className="absolute right-0 top-full mt-2 bg-white shadow-lg border rounded-md w-40 text-base z-50"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true); // Show edit form
              }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 w-full"
            >
              <FaPencilAlt className="text-blue-500" /> Edit
            </button>

            <button
              onClick={() => setDeleteDialog(true)}
              className="flex items-center gap-3 px-5 py-3 hover:bg-red-100 w-full text-red-600"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Role Dialog Box */}

      <AddDepartmentForm
        isVisible={isEditing}
        title="Edit Department"
        onClose={() => setIsEditing(false)}
        onEditDept={onEditDept}
        existingDept={dept}
      />
      <DialogBox
        title="Confirm Deletion"
        discription="Are you sure you want to delete this Dept permanently?"
        isVisible={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onSubmit={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeptCard;
