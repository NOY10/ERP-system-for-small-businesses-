import React, { useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

const DataTable = ({ columns, rows, onEdit, onDelete }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const enhancedColumns = [
    ...columns,
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button onClick={() => onEdit(params.row)} className="text-blue-500">
            Edit
          </button>
          <button
            onClick={() => onDelete(params.row.id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

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
      {selectedRows.length > 1 && (
        <div className="flex justify-start space-x-4 mb-2">
          <button
            onClick={onDelete}
            className="flex items-center rounded overflow-hidden"
          >
            {/* Left Section: DELETE text */}
            <span className="bg-red-500 text-white px-4 py-2 text-normal font-bold">
              DELETE
            </span>

            {/* Right Section: Icon */}
            <span className="bg-gray-400 flex items-center justify-center px-2 py-2">
              <span className="text-white text-normal font-bold">X</span>
            </span>
          </button>
        </div>
      )}

      {/* {error && <div className="text-red-500 mt-4">{error}</div>} */}
      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        getRowId={(row) => row._id}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
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

export default DataTable;
