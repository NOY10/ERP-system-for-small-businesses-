import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import useAuthStore from "../../../../store/useAuthStore";

const LeaveCardModal = ({ onClose, onSave, editingAllowance }) => {
  const { token } = useAuthStore();
  const [allowance, setAllowance] = useState({
    leaveType: "",
    days: 0,
    payment: false,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Set the data if editing an existing allowance
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

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSave = async () => {
    try {
      const url = allowance._id
        ? `http://localhost:8000/updateLeaveType/${allowance._id}`
        : "http://localhost:8000/addLeaveType";

      const method = allowance._id ? "PUT" : "POST";

      const requestBody = {
        ...allowance,
        payment: allowance.payment === "Paid",
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        const colorClasses = [
          "bg-blue-400",
          "bg-green-400",
          "bg-yellow-400",
          "bg-red-500",
          "bg-lime-400",
        ];

        if (data.leaveType) {
          const updatedLeaveType = {
            ...data.leaveType,
            color: allowance._id
              ? allowance.color
              : colorClasses[Math.floor(Math.random() * colorClasses.length)],
            payment: data.leaveType.payment ? "Paid" : "Unpaid",
          };
          setSnackbar({
            open: true,
            message: allowance._id
              ? "Leave type updated successfully!"
              : "Leave type saved successfully",
            severity: "success",
          });
          setTimeout(() => {
            onClose();
            onSave(updatedLeaveType);
          }, 1000);
        }
      } else {
        console.error("Error saving leave type:", response.statusText);
        setSnackbar({
          open: true,
          message: "Failed to save leave type!",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving leave type:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while saving!",
        severity: "error",
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {editingAllowance ? "Edit Leave Type" : "New Leave Type"}
          </h2>

          {/* Form Section */}
          <div className="border border-gray-300 p-6">
            <div className="grid gap-4">
              {/* Leave Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Leave Type *
                </label>
                <input
                  type="text"
                  name="leaveType"
                  placeholder="Enter leave type"
                  className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={allowance.leaveType}
                  onChange={handleInputChange}
                />
              </div>

              {/* Number of Days */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Number of Days *
                </label>
                <input
                  type="number"
                  name="days"
                  placeholder="Enter Number of days"
                  className="border p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={allowance.days}
                  onChange={handleInputChange}
                />
              </div>

              {/* Payment */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Payment
                </label>
                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    name="payment"
                    checked={allowance.payment}
                    onChange={handleInputChange}
                    className="mr-2 w-6 h-6"
                  />
                  <span className="text-gray-700 pl-2">Paid</span>
                </div>
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
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            color: "white",
            backgroundColor:
              snackbar.severity === "success" ? "#22c55e" : "#ef4444",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LeaveCardModal;
