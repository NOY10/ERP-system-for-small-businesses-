import React, { useEffect, useState } from "react";
import {
  Avatar,
  IconButton,
  Button,
  Tooltip,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { Snackbar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FiSettings, FiUserPlus, FiTrash2 } from "react-icons/fi";

import AddUser from "./AddUser";
import useAuthStore from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

function UserDataGrid() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const navigate = useNavigate();

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8000/getallEmployees", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const formattedData = data.employees.map((employees) => ({
            id: employees.employeeId,
            name: employees.name,
            email: employees.email,
            role: employees.role,
            createdBy: employees.createdBy,
          }));
          setUsers(formattedData);
        }
      } catch (error) {
        console.error("Error adding user:", error);
      }
    };
    fetchEmployees();
  }, [token]);

  const dialogClose = () => {
    setSelectedUser(null);
    setOpenAddDialog(false);
    setOpenEditDialog(false);
  };

  const handleEditClick = (event, user) => {
    event.stopPropagation();
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  const handleEditSave = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleAddUser = (newUser) => {
    const newId = users.length ? users[users.length - 1].id + 1 : 1;
    const newUserWithId = { ...newUser, id: newId };

    setUsers((prevUsers) => [...prevUsers, newUserWithId]);
    setOpenAddDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUsers = async () => {
    try {
      // Iterate over each selected user ID and send a delete request
      await Promise.all(
        selectedRows.map(async (id) => {
          const response = await fetch(
            `http://localhost:8000/deleteEmployee/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to delete employee");
          }
        })
      );

      // Remove deleted users from the local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedRows.includes(user.id))
      );

      // Clear the selection
      setSelectedRows([]);

      // Show success message
      setSnackbar({
        open: true,
        message: "Selected Employees deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting employees:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete employees",
        severity: "error",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: "profile",
      headerName: "USER DETAILS",
      width: 400,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={2} height="100%">
          <Avatar
            src={params.row.avatar}
            alt="Profile"
            sx={{ width: 60, height: 60 }}
          />
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="subtitle1">{params.row.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "id",
      headerName: "EMPLOYEE ID",
      width: 200,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: "role",
      headerName: "ROLE",
      width: 180,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: "createdBy",
      headerName: "CREATED BY",
      width: 180,
      renderCell: (params) => <div>{params.value}</div>,
    },
    {
      field: "actions",
      headerName: "",
      width: 100,

      renderCell: (params) => (
        <Tooltip title="Edit User">
          <IconButton onClick={(event) => handleEditClick(event, params.row)}>
            <FiSettings />
          </IconButton>
        </Tooltip>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className="w-[100%] max-w-7xl mx-auto">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <label className="relative cursor-pointer block w-[220px] h-[40px] mt-1">
          <input
            type="text"
            className="peer h-[40px] pl-2 w-full border rounded-md outline-none focus:border-primary placeholder-opacity-0 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-2 text-base text-[#666666] bg-white text-opacity-80 font-normal transition-all duration-200 ease-in-out scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-x-3 peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-primary peer-focus:px-2">
            Search
          </span>
        </label>
        <Box display="flex" gap={1}>
          {selectedRows.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<FiTrash2 />}
              onClick={handleDeleteUsers}
            >
              Delete
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<FiUserPlus />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <DataGrid
        rows={filteredUsers}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        autoHeight
        checkboxSelection
        disableColumnMenu
        disableSelectionOnClick
        disableRowSelectionOnClick // Add this line
        onRowClick={(params) => {
          navigate(`/staff/${params.id}`);
        }}
        onRowSelectionModelChange={(newSelection) =>
          setSelectedRows(newSelection)
        }
        selectionModel={selectedRows}
        getRowHeight={() => 80}
        sx={{
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
            backgroundColor: "#f5f5f5",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#fff",
          },
        }}
      />

      <AddUser
        onAddUser={handleAddUser}
        onEditUser={handleEditSave}
        openDialog={openAddDialog || openEditDialog}
        dialogClose={dialogClose}
        selectedUser={selectedUser}
      />
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
}

export default UserDataGrid;
