import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import useAuthStore from "../../../../store/useAuthStore";
import { FaRegEye } from "react-icons/fa";
import { Alert, Snackbar } from "@mui/material";

import { API_BASE_URL } from "../../../../config/api";

const colorClasses = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-gray-500",
];

const LeaveRequests = ({ onViewDetails, pendingLeaves }) => {
  const { token } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });
  // useEffect(() => {
  //   setLeaveRequests(pendingLeaves);
  // }, [pendingLeaves]);
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  }

  useEffect(() => {
    const updatedLeaves = pendingLeaves.map((leave, index) => ({
      ...leave,
      color: colorClasses[index % colorClasses.length], // Assign colors cyclically
    }));
    setLeaveRequests(updatedLeaves);
  }, [pendingLeaves]);

  const handleStatusChange = (leave, newStatus) => {
    if (!leave) return;

    if (newStatus === "Rejected") {
      setSelectedLeave(leave);
      setShowRejectModal(true);
      return;
    }

    const updatedLeave = {
      ...leave,
      status: newStatus,
      rejectionReason: null,
    };

    updateLeaveStatus(updatedLeave);
  };

  const updateLeaveStatus = (updatedLeave) => {
    fetch(`${API_BASE_URL}/updateLeave/${updatedLeave._id}`, {
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
         message:"Leave Request Updated Successfully" ,
            severity: "success",
          });

          // Remove the leave request from the list
          setLeaveRequests((prev) =>
            prev.filter((leave) => leave._id !== data.leave._id)
          );
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        alert("Failed to update leave status. Please try again.");
      });

    setShowRejectModal(false);
    setRejectionReason("");
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
        leaveRequests.map((leave) => (
          <div
            key={leave._id}
            className="border p-4 mb-2 rounded flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${leave.color}`}
              >
                {leave.employee?.name
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")}
              </div>
              <div>
                <p className="font-bold">{leave.employee?.name}</p>
                <p className="text-gray-500">{leave.leaveType}</p>
                <p className="text-gray-500">
                  {leave.startDate} to {leave.endDate}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="flex gap-2 items-center bg-green-400 text-white px-4 py-3 rounded hover:bg-green-500"
                onClick={() => handleStatusChange(leave, "Approved")}
                disabled={leave.status === "Approved"}
              >
                <FaCheckCircle className="text-white text-xl" />{" "}
                <span>
                  {leave.status === "Approved" ? "Approved" : "Approve"}
                </span>
              </button>
              <button
                className="flex items-center gap-2 bg-red-400 text-white px-4 py-3 rounded hover:bg-red-500"
                onClick={() => handleStatusChange(leave, "Rejected")}
                disabled={leave.status === "Rejected"}
              >
                <FaTimesCircle className="text-white text-xl" />
                <span>
                  {leave.status === "Rejected" ? "Rejected" : "Reject"}
                </span>
              </button>
              <button
                onClick={() => onViewDetails(leave)}
                className="flex gap-2 items-center font-medium text-white bg-blue-400 hover:bg-blue-600 p-3 rounded"
              >
                <FaRegEye className="text-white text-lg" />{" "}
                <span> View Details</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No leave requests available.</p>
      )}

      {/* Reject Modal */}
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
                onClick={() => {
                  if (selectedLeave) {
                    updateLeaveStatus({
                      ...selectedLeave,
                      status: "Rejected",
                      rejectionReason: rejectionReason,
                    });
                  }
                }}
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
                  >
                    <Alert
                      onClose={handleSnackbarClose}
                      severity={snackbar.severity}
                      sx={{ width: "100%", color:"white", backgroundColor:"#22c55e", "& .MuiAlert-icon": {
                        color: "white",
                      },}}
                    >
                      {snackbar.message}
                    </Alert>
                  </Snackbar>
    </div>
  );
};

export default LeaveRequests;
