import React, { useState } from "react";
import { format } from "date-fns";
// import useAuthStore from "../../../store/useAuthStore";
import { RxCrossCircled } from "react-icons/rx";

const LeaveDetails = ({ leave, onClose }) => {
  if (!leave) return null;

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
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;
