import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Toast from "../../../../Components/Toast";

function AdvanceTable({ loans, handleEdit, handleDelete }) {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState(loans);

  const columns = [
    // { field: "id", headerName: "Loan ID", flex: 1 },
    { field: "employee", headerName: "Name", flex: 1 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "amount", headerName: "Amount (BTN)", flex: 1 },
    {
      field: "installmentAmount",
      headerName: "Installment Amount",
      flex: 1,
    },
    {
      field: "totalInstallments",
      headerName: "Total Installment ",
      flex: 1,
    },

    { field: "providedDate", headerName: "Date", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",

      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-3 align-items-center justify-center mt-3">
          <button
            className="text-blue-500 hover:text-blue-700 text-xl"
            onClick={() => handleEdit(params.row)}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(params.row.id)}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white">
      {showToast && (
        <Toast
          type="success"
          title="Loan Deleted Successfully!"
          message="The loan was removed from the system."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      <Paper sx={{ height: "auto", width: "99%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          pagination
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          getRowId={(row) => row.id || `${row.employee}-${row.providedDate}`}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #f0f0f0" },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
            },
          }}
        />
      </Paper>
    </div>
  );
}

export default AdvanceTable;
