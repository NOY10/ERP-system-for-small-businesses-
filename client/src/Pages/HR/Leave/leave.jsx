import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import LeaveStats from "./LeaveStats";
import LeaveHistory from "./LeaveHistory";
import LeaveDetailsModal from "./LeaveDetailsModal";
import RequestLeaveForm from "./RequestLeaveForm";
import useAuthStore from "../../../store/useAuthStore";
import LeaveRequests from "./LeaveRequest/LeaveRequest";
import LeaveType from "./LeaveType/LeaveType";
import {
  FaFileCircleCheck,
  FaFileCircleXmark,
  FaFileCircleExclamation,
} from "react-icons/fa6";
import { FcLeave } from "react-icons/fc";

import { API_BASE_URL } from "../../../config/api";

const LeaveManagement = () => {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Leave History");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveStatics, setLeaveStatics] = useState([]);
  const [pending, setPending] = useState([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllLeaves`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leave history");
        }

        const result = await response.json();
        const colorClasses = [
          "bg-green-400",
          "bg-yellow-400",
          "bg-red-500",
          "bg-lime-400",
          "bg-blue-400",
        ];
        const leaveStatistics = result.leaves;
        const filteredLeaves = result.leaves.filter(
          (leave) => leave.status === "Approved" || leave.status === "Rejected"
        );
        // const pendingLeaves = result.leaves.filter(
        //   (leave) => leave.status === "Pending"
        // );
        const pendingLeaves = result.leaves
          .filter((leave) => leave.status === "Pending")
          .map((leave, index) => ({
            ...leave,
            color: colorClasses[index % colorClasses.length],
          }));

        setLeaveHistory(filteredLeaves);
        setLeaveStatics(leaveStatistics);
        setPending(pendingLeaves);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLeaveHistory();
  }, [leaveHistory, pending, leaveStatics, token]);

  // Calculate leave statistics dynamically
  const leaveStats = [
    {
      title: "Total Leaves",
      count: leaveStatics.length,
      color: "bg-blue-500",
      icon: <FcLeave className="text-[30px]" />,
    },
    {
      title: "Pending Leaves",
      count: leaveStatics.filter((leave) => leave.status === "Pending").length,
      color: "bg-yellow-500",
      icon: <FaFileCircleExclamation className="text-yellow-500 text-[30px]" />,
    },
    {
      title: "Approved Leaves",
      count: leaveStatics.filter((leave) => leave.status === "Approved").length,
      color: "bg-green-500",
      icon: <FaFileCircleCheck className="text-green-500 text-[30px]" />,
    },
    {
      title: "Rejected Leaves",
      count: leaveStatics.filter((leave) => leave.status === "Rejected").length,
      color: "bg-red-500",
      icon: <FaFileCircleXmark className="text-red-500 text-[30px]" />,
    },
  ];

  const handleViewDetails = (leaves) => {
    setSelectedLeave(leaves);
    setShowDetailsModal(true);
  };

  const updateLeaveStatus = (updatedLeave) => {
    setLeaveHistory((prev) =>
      prev.map((leave) => (leave.id === updatedLeave.id ? updatedLeave : leave))
    );
    setShowDetailsModal(false);
  };

  const handleDelete = (deletedRows) => {
    setLeaveHistory((prev) =>
      prev.filter(
        (leave) =>
          !deletedRows.some((deletedLeave) => deletedLeave.id === leave.id)
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-7xl md:text-3xl font-bold text-gray-700">
            Leave Management
          </h1>
          <p className="text-gray-400 mt-2">
            {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>

      <LeaveStats stats={leaveStats} />
      {/* Tabs Navigation */}
      <div className="flex mt-6 border-b">
        <button
          className={`px-4 py-2 text-lg ${
            selectedTab === "Leave History"
              ? "border-b-2 border-b-blue-500 text-blue-500"
              : "text-gray-700"
          }`}
          onClick={() => setSelectedTab("Leave History")}
        >
          Leave History
        </button>
        <button
          className={`px-4 py-2 text-lg ml-4 ${
            selectedTab === "LeaveType"
              ? "border-b-2 border-b-blue-500 text-blue-500"
              : "text-gray-700"
          }`}
          onClick={() => setSelectedTab("LeaveType")}
        >
          Add LeaveType
        </button>
        <button
          className={`px-4 py-2 text-lg ml-4 ${
            selectedTab === "Leave Request"
              ? "border-b-2 border-b-blue-500 text-blue-500"
              : "text-gray-700"
          }`}
          onClick={() => setSelectedTab("Leave Request")}
        >
          Leave Request
        </button>
       {user?.role !=='Owner' && ( <button
          className={`px-4 py-2 text-lg ml-auto ${
            selectedTab === "Request Leave"
              ? " text-blue-500"
              : "bg-blue-500 text-white rounded-md"
          }`}
          onClick={() => setSelectedTab("Request Leave")}
        >
          Add Request Leave
        </button>
        )}
      </div>

      {/* Conditionally Render Components Based on Selected Tab */}
      {selectedTab === "Leave History" && (
        <LeaveHistory
          leaveHistory={leaveHistory}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
        />
      )}
      {selectedTab === "Request Leave" && (
        <RequestLeaveForm onClose={() => setSelectedTab("Leave History")} />
      )}
      {selectedTab === "Leave Request" && (
        <LeaveRequests
          onViewDetails={handleViewDetails}
          pendingLeaves={pending}
        />
      )}
      {selectedTab === "LeaveType" && <LeaveType />}

      {showDetailsModal && (
        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={updateLeaveStatus}
        />
      )}

      {showRequestForm && (
        <RequestLeaveForm onClose={() => setShowRequestForm(false)} />
      )}
    </div>
  );
};

export default LeaveManagement;
