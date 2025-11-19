import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCrossCircled } from "react-icons/rx";
import useAuthStore from "../../store/useAuthStore";
import { Alert, Snackbar } from "@mui/material";


const RequestLeaveForm = ({ onClose, leaveData, leaveType: propLeaveType }) => {
  const { token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const passedLeaveData = location.state?.leave || leaveData || null;
  const isEditing = !!passedLeaveData;
  const passedLeaveType = location.state?.leaveType || propLeaveType || "";

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: passedLeaveData?.leaveType || passedLeaveType,
    startDate: passedLeaveData?.startDate || "",
    endDate: passedLeaveData?.endDate || "",
    reason: passedLeaveData?.reason || "",
    contact: passedLeaveData?.contact || "",
    days: passedLeaveData?.days || 0,
  });
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    const handleSnackbarClose = () => {
      setSnackbar({ ...snackbar, open: false });
    };

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch("http://localhost:8000/getAllLeaveTypes", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (response.ok) setLeaveTypes(result.leaveTypes);
        else console.error("Error fetching leave types:", result.error);
      } catch (error) {
      }
    };

    fetchLeaveTypes();
  }, [token]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate leave days automatically
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const differenceInDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
      setFormData((prev) => ({
        ...prev,
        days: differenceInDays > 0 ? differenceInDays : 0,
      }));
    }
  }, [formData.startDate, formData.endDate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:8000/updateLeave/${passedLeaveData._id}`
      : "http://localhost:8000/addLeave";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: isEditing
            ? "Leave request updated successfully!"
            : "Leave request submitted successfully!",
          severity: "success",
        });
        setTimeout(() => {
          onClose(); 
        }, 2000);
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit Leave Request" : "New Leave Request"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <RxCrossCircled className="text-xl text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-gray-300 p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Leave Type *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              >
                <option value="" disabled>
                  Select Leave Type
                </option>
                {leaveTypes.map((leave) => (
                  <option key={leave._id} value={leave.leaveType}>
                    {leave.leaveType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-500 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-500 mb-2">
              Number of Days *
            </label>
            <input
              type="number"
              name="days"
              value={formData.days}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-500 mb-2">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows="4"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/Leave")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {isEditing ? "Update Request" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
    </div>
  );
};

export default RequestLeaveForm;
