import React from "react";
import { CiImport } from "react-icons/ci";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const QuotationHeader = () => {
  const navigate = useNavigate();

  const handleNewExpense = () => {
    navigate("/Quotation/NewQuotation");
  };

  const handleImport = () => {
    navigate("/Import/quotation", {
      state: { title: "Quotation" },
    });
  };

  return (
    <div className="flex items-center justify-between px-4 bg-white shadow rounded-lg h-[70px]">
      <div>
        <span className="text-gray-700 font-semibold text-lg">
          All Quotation
        </span>
      </div>

      {/* Spacer to move the buttons to the right */}
      <div className="ml-auto flex items-center space-x-4">
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

export default QuotationHeader;
