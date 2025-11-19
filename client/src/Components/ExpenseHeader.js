import React from "react";
import { CiImport } from "react-icons/ci";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ExpenseHeader = ({ className }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNewExpense = () => {
    navigate("/newExpense"); // Navigate to NewExpense page
  };

  const handleImport = () => {
    // Simulate import functionality
    const importOption = window.confirm(
      "Choose import source:\nClick OK for Google Drive, Cancel for Desktop."
    );
    if (importOption) {
      alert("Google Drive import selected.");
    } else {
      alert("Desktop import selected.");
    }
  };

  return (
    <div className="flex items-center justify-between px-4 mb-4 bg-white shadow rounded-lg h-[70px]">
      <div>
        <span className="text-gray-700 font-semibold text-lg">
          All Expenses
        </span>
      </div>

      {/* Spacer to move the buttons to the right */}
      <div className="ml-auto flex items-center space-x-4">
        {/* Notification Icon */}
        {/* <div className="relative">
          <button className="flex items-center justify-center p-2 bg-yellow-100 rounded-full">
            <svg
              className="h-8 w-8 text-yellow-500"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
              <circle cx="16" cy="8" r="3" />
            </svg>
          </button>
          <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            1
          </span>
        </div> */}

        <button
          onClick={handleNewExpense}
          className="flex items-center justify-center gap-x-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm ml-auto"
        >
          <FaPlusCircle className="text-white text-[18px]" />
          <p className="text-sm">New</p>
        </button>
        <button
          onClick={handleImport}
          className="flex items-center justify-center gap-x-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm  ml-auto"
        >
          <CiImport className="text-white text-[20px]" />
          <p className="text-sm">Import</p>
        </button>
      </div>
    </div>
  );
};

export default ExpenseHeader;
