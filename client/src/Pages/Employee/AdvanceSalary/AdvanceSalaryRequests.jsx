import React, { useEffect, useState } from "react";
import { FaCheck, FaTimesCircle, FaEye } from "react-icons/fa";
import useAuthStore from "../../../store/useAuthStore";

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

const AdvanceSalaryRequests = ({ requests, onStatusUpdate }) => {
  const { token } = useAuthStore();
  const [requestList, setRequestList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!Array.isArray(requests)) return;

    const updatedRequests = requests
      .filter((req) => req !== undefined && req !== null)
      .map((req, index) => ({
        ...req,
        status: req.status || "Pending",
        color: colorClasses[index % colorClasses.length],
      }));

    setRequestList(updatedRequests);
  }, [requests]);

  // Generic handler for both approve and reject actions

  const handleView = (req) => {
    setSelectedRequest(req);
  };

  return (
    <div className="p-2 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Advance Salary Requests
      </h1>
      {requestList.length > 0 ? (
        requestList.map((req) => (
          <div
            key={req._id}
            className="border p-4 mb-2 rounded flex justify-between items-center bg-white shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold hover:w-24 hover:h-24 ${req.color}`}
              >
                {req.employee
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <div>
                <p className="font-bold">{req.employee}</p>
                <p className="text-gray-500">Amount: Nu {req.amount}</p>
                <p className="text-gray-500">Date: {req.providedDate}</p>
                <p
                  className={`font-semibold ${
                    req.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  Status: {req.status}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStatusUpdate(req._id, "Rejected")}
                className="flex items-center gap-2 bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
              >
                <FaTimesCircle className="text-white text-lg" />
                <span>Reject</span>
              </button>
              <button
                className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                onClick={() => handleView(req)}
              >
                <FaEye className="text-white text-lg" />
                <span>View</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No advance salary requests available.</p>
      )}

      {/* View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl relative border border-gray-400">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
            >
              &times;
            </button>

            {/* Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Advance Salary Request
            </h2>

            <div className="border border-gray-400 p-2">
              {/* Employee Info (Single Column) */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl ${selectedRequest.color}`}
                >
                  {selectedRequest.employee
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {selectedRequest.employee}
                  </p>
                  <p className="text-gray-500">
                    Request ID: {selectedRequest.id}
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                <div className="flex flex-col items-start border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Amount:
                  </span>
                  <span className="text-green-600 font-semibold">
                    Nu {selectedRequest.amount}
                  </span>
                </div>
                <div className="flex flex-col items-start border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Title:
                  </span>
                  <span>{selectedRequest.title}</span>
                </div>
                <div className="flex flex-col items-start border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Date:
                  </span>
                  <span>{selectedRequest.providedDate}</span>
                </div>
                <div className="flex flex-col items-start border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      selectedRequest.status === "Rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="flex flex-col items-start  border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Installment Amount:
                  </span>
                  <span>{selectedRequest.installmentAmount}</span>
                </div>
                <div className="flex flex-col items-start  border rounded-lg p-1 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Total Installments:
                  </span>
                  <span>{selectedRequest.totalInstallments}</span>
                </div>
                <div className="col-span-2 mt-2 flex flex-col items-start  border rounded-lg p-2 bg-gray-50">
                  <span className="block text-gray-600 font-semibold capitalize">
                    Description:
                  </span>
                  <span className="block text-gray-600 mt-1">
                    {selectedRequest.description}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 text-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 text-white font-medium bg-red-500 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceSalaryRequests;
