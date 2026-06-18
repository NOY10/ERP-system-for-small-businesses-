import React, { useState } from "react";
import { format } from "date-fns";
// import useAuthStore from "../../../store/useAuthStore";
import { RxCrossCircled } from "react-icons/rx";
import useAuthStore from "../../../store/useAuthStore";
import { Alert, Snackbar } from "@mui/material";

import { API_BASE_URL } from "../../../config/api";

const LeaveDetailsModal = ({ leave, onClose, onStatusUpdate }) => {
  const { token } = useAuthStore();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleStatusChange = (newStatus) => {
    if (!leave) return;

    if (newStatus === "Rejected" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    const updatedLeave = {
      ...leave,
      status: newStatus,
      rejectionReason: newStatus === "Rejected" ? rejectionReason : null,
    };

    console.log("Updated Leave Payload:", updatedLeave);

    fetch(`${API_BASE_URL}/updateLeave/${leave._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedLeave),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          setSnackbar({
            open: true,
            message: "Leave Status updated successfully!",
            severity: "success",
          });
          if (onStatusUpdate) {
            onStatusUpdate(data.leave);
          }
          setTimeout(()=>{
            onClose()
          },1000);
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        setSnackbar({
          open: true,
          message: "Failed to updtate leave status",
          severity: "error",
        });
      });

    setShowRejectModal(false);
    setRejectionReason("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Leave Request Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 hover:border hover:border-red-500 rounded-sm p-1"
          >
            <RxCrossCircled className="text-xl text-gray-600 hover:text-red-500" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Leave Type
              </label>
              <input
                type="text"
                value={leave.leaveType}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Start Date
              </label>
              <input
                type="text"
                value={format(new Date(leave.startDate), "MMM dd, yyyy")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                End Date
              </label>
              <input
                type="text"
                value={format(new Date(leave.endDate), "MMM dd, yyyy")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Days
              </label>
              <input
                type="Number"
                value={leave.days}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-500 mb-2">
              Reason for Leave
            </label>
            <textarea
              value={leave.reason}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows="4"
              readOnly
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleStatusChange("Pending")}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Mark as Pending
            </button>
            <button
              onClick={() => handleStatusChange("Approved")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Reason for Rejection
            </h3>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows="3"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange("Rejected")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
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
            backgroundColor: snackbar.severity === "success" ? "#22c55e" : "#ef4444",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LeaveDetailsModal;
