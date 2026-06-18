import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";
import useAuthStore from "../../../store/useAuthStore";

import { API_BASE_URL } from "../../../config/api";

const LeaveHistory = ({ leaveHistory, onViewDetails }) => {
  const { token } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Array.isArray(leaveHistory)) {
      const updatedRows = leaveHistory.map((leave, index) => ({
        id: leave._id || index,
        _id: leave._id,
        employee: leave.employee?.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days || 0,
        status: leave.status,
        reason: leave.reason,
      }));
      setRows(updatedRows);
    }
  }, [leaveHistory]);

  const columns = [
    { field: "employee", headerName: "Employee", flex: 1 },
    { field: "leaveType", headerName: "LeaveType", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
    },
    { field: "days", headerName: "Days", flex: 0.5 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.row?.status;
        const statusIcon =
          status === "Approved" ? (
            <FaCheckCircle className="text-green-500 text-xl" />
          ) : status === "Pending" ? (
            <MdOutlinePending className="text-yellow-500 text-xl" />
          ) : (
            <FaTimesCircle className="text-red-500 text-xl" />
          );
        return (
          <div className="flex items-center space-x-2">
            {statusIcon}
            <span>{status}</span>
          </div>
        );
      },
    },
    { field: "reason", headerName: "Reason", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <button
          onClick={() => onViewDetails(params.row)}
          className="text-blue-500 hover:text-blue-700"
        >
          View Details
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const handleDelete = async () => {
    if (selectedRows.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/deleteLeave`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedRows }),
        });

        const result = await response.json();

        if (response.ok) {
          const updatedRows = rows.filter(
            (row) => !selectedRows.includes(row._id)
          );
          setRows(updatedRows);
          setSelectedRows([]);
        } else {
          setError(result.error || "Failed to delete leave request.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setError("An error occurred while deleting the leave request.");
      }
    }
  };

  return (
    <Box
      sx={{
        height: "auto",
        width: "100%",
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {selectedRows.length > 0 && (
        <div className="flex justify-start space-x-4 mb-2">
          <button
            onClick={handleDelete}
            className="flex items-center rounded overflow-hidden"
          >
            {/* Left Section: DELETE text */}
            <span className="bg-red-500 text-white px-4 py-2 text-sm font-bold">
              DELETE
            </span>

            {/* Right Section: Icon */}
            <span className="bg-gray-400 flex items-center justify-center px-2 py-2">
              <span className="text-white text-sm font-bold">X</span>
            </span>
          </button>
        </div>
      )}

      {error && <div className="text-red-500 mt-4">{error}</div>}

      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: { showQuickFilter: true },
        }}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        checkboxSelection
        onRowSelectionModelChange={(ids) => {
          setSelectedRows(ids);
        }}
        disableColumnFilter
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default LeaveHistory;
