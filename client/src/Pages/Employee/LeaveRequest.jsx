import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RxCrossCircled } from "react-icons/rx";
import { FaRegEye, FaEdit } from "react-icons/fa";
import useAuthStore from "../../store/useAuthStore";
import ConfirmationModal from "./ConfirmationModal"; 

import { API_BASE_URL } from "../../config/api";

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

const LeaveRequest = ({ onViewDetails, pendingLeaves }) => {
  const { token } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const updatedLeaves = pendingLeaves.map((leave, index) => ({
      ...leave,
      color: colorClasses[index % colorClasses.length],
    }));
    setLeaveRequests(updatedLeaves);
  }, [pendingLeaves]);

  const handleEdit = (leave) => {
    navigate("/LeaveRequestForm", { state: { leave } });
  };

  const handleCancelClick = (id) => {
    setSelectedLeaveId(id);
    setIsModalOpen(true); 
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteLeave`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [selectedLeaveId] }),
      });

      const data = await response.json();
      if (response.ok) {
        setLeaveRequests((prevRequests) =>
          prevRequests.filter((leave) => leave._id !== selectedLeaveId)
        );
        alert("Leave request canceled successfully");
      } else {
        alert(data.error || "Error canceling leave request");
      }
    } catch (error) {
      console.error("Error canceling leave request:", error);
      alert("Error canceling leave request");
    } finally {
      setIsModalOpen(false); 
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false); 
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      {leaveRequests.length > 0 ? (
        leaveRequests.map((leave) => (
          <div
            key={leave._id}
            className="border p-4 mb-2 rounded flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${leave.color}`}
              >
                {leave.leaveType
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")}
              </div>
              <div>
                <p className="text-gray-500">{leave.leaveType}</p>
                <p className="text-gray-500">
                  {leave.startDate} to {leave.endDate}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="flex items-center bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                onClick={() => onViewDetails(leave)}
              >
                <FaRegEye className="mr-2" /> View
              </button>
              <button
                className="flex items-center bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                onClick={() => handleEdit(leave)}
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button
                className="flex items-center bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
                onClick={() => handleCancelClick(leave._id)}
              >
                <RxCrossCircled className="mr-2 text-xl" /> Cancel
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No leave requests available.</p>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleCancel}
        message="Are you sure you want to cancel this leave request?"
      />
    </div>
  );
};

export default LeaveRequest;
