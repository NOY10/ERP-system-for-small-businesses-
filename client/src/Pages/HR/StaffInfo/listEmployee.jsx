import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";

import { API_BASE_URL } from "../../../config/api";

const pastelColors = [
  "#f07167",
  "#335c67",
  "#7f5539",
  "#f28482",
  "#f5cac3",
  "#6b705c",
  "#cb997e",
  "#9d6b53",
  "#c9cba3",
  "#eae0d5",
  "#b392ac",
  "#735d78",
  "#e27396",
  "#f29559",
  "#acd8aa",
];

const getRandomColor = (() => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      colorMap.set(
        id,
        pastelColors[Math.floor(Math.random() * pastelColors.length)]
      );
    }
    return colorMap.get(id);
  };
})();

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join(" ")
    .toUpperCase();
};

function ListEmployee({ employees }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaffData, setFilteredStaffData] = useState(employees);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    setFilteredStaffData(employees);
  }, [employees]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/deleteEmployee/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          window.location.reload();
          setFilteredStaffData(
            filteredStaffData.filter((staff) => staff.id !== id)
          );
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        } else {
          setError("Failed to delete employee");
        }
      } catch (error) {
        setError("Error deleting employee");
      }
    }
  };

  const editStaff = (id) => {
    navigate(`/staff/${id}`);
  };

  const columns = [
    { field: "id", headerName: "Employee ID", width: 100 },
    {
      field: "name",
      headerName: "Staff Name",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold"
            style={{ backgroundColor: getRandomColor(params.row.id) }}
          >
            {getInitials(params.row.name)}
          </div>
          <span>{params.row.name}</span>
        </div>
      ),
    },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone Number", width: 200 },
    {
      field: "salary",
      headerName: "Salary (BTN)",
      width: 200,
      renderCell: (params) => (
        <span
          className="px-2 py-1 rounded-lg text-white"
          style={{ backgroundColor: getRandomColor(params.row.id) }}
        >
          Nu. {params.row.salary}
        </span>
      ),
    },
    { field: "cid", headerName: "མི་ཁུངས་ཀྱི་ངོ་རྟགས་ལག་ཁྱེར", width: 200 },
    { field: "role", headerName: "Role", width: 150 },
    { field: "department", headerName: "Department", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <div className="flex w-full h-full">
          <div className="flex-1 flex items-center justify-center bg-gray-200 p-3">
            <button
              onClick={() => editStaff(params.row.id)}
              className="text-blue-500 hover:text-blue-700 text-xl"
            >
              <FaEdit />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-200 p-3">
            <button
              onClick={() => handleDelete(params.row.id)}
              className="text-red-500 hover:text-red-700 text-xl"
            >
              <FaTrashAlt />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white">
      {showToast && (
        <Toast
          type="success"
          title="Employee Deleted Successfully!"
          message="The employee was removed from the system."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      <Paper
        sx={{
          height: 600, // Increased height
          width: "100%",
          overflow: "auto",
          minWidth: 1200, // Minimum width to ensure horizontal scroll
        }}
      >
        <DataGrid
          rows={filteredStaffData.map((staff) => ({ ...staff, id: staff.id }))}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          pagination
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fff",
              zIndex: 10,
              position: "sticky",
              top: 0,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
              // Remove cell hover effect
            },
            "& .MuiDataGrid-row": {
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "#f5f5f5 !important",
                cursor: "pointer",
              },
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "auto",
              overflowY: "auto",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
        />
      </Paper>
    </div>
  );
}

export default ListEmployee;
