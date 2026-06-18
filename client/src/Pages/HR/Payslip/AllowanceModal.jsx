import React, { useState, useEffect } from "react";

const AllowanceModal = ({ onClose, onSave, editingAllowance }) => {
  const [allowance, setAllowance] = useState({
    title: "",
    amount: "",
    taxable: false,
    oneTime: false,
    date: "",
  });

  useEffect(() => {
    if (editingAllowance) {
      setAllowance(editingAllowance);
    }
  }, [editingAllowance]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAllowance((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {editingAllowance ? "Edit Allowance" : "New Allowance"}
        </h2>

        {/* Form Section */}
        <div className="border border-gray-300 p-6 ">
          <div className="grid gap-4">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter title"
                className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                value={allowance.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                className="border p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                value={allowance.amount}
                onChange={handleInputChange}
              />
            </div>

            {/* Taxable & One Time Checkboxes */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Taxable
                </label>
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="taxable"
                    checked={allowance.taxable}
                    onChange={handleInputChange}
                    className="mr-2 w-6 h-6"
                  />
                  <span className="text-gray-700 pl-2">Yes</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  One Time
                </label>
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="oneTime"
                    checked={allowance.oneTime}
                    onChange={handleInputChange}
                    className="mr-2 w-6 h-6"
                  />
                  <span className="text-gray-700 pl-2">Yes</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                value={allowance.date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={onClose}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(allowance)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllowanceModal;
