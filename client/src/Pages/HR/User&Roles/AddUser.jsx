import React, { useState, useEffect, useRef } from "react";
import DialogBox from "../../../Components/Dialogbox";
import useAuthStore from "../../../store/useAuthStore";
import { Alert, Snackbar } from "@mui/material";

import { API_BASE_URL } from "../../../config/api";

function AddUser({
  onAddUser,
  onEditUser,
  openDialog,
  dialogClose,
  selectedUser,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const { token } = useAuthStore();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // Prevent multiple clicks

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    if (!openDialog) {
      setFormData({ name: "", email: "", role: "", avatar: null });
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } else if (selectedUser) {
      setFormData(selectedUser);
    }
  }, [openDialog, selectedUser]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return; // Prevent rapid double clicks
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.role) {
      setError("All fields must be filled out");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    setError("");

    try {
      if (selectedUser) {
        const updatedUser = {
          id: selectedUser.employeeId,
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        const response = await fetch(
          `${API_BASE_URL}/updateEmployee/${selectedUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedUser),
          }
        );

        const data = await response.json();

        if (response.ok) {
          onEditUser(formData);
          dialogClose();
          setError("");
          setSnackbar({
            open: true,
            message: "User Edited Successfully",
            severity: "success",
          });
          dialogClose();
        } else {
          setError(data.message || "Failed to update employee");
        }
      } else {
        const userPayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          gender:"Other",
          department: "Not Assigned",
          dob: "2000-01-01",
          phone: "00000000",
          cid: "00000000000",
          salary: 0,
        };

        const response = await fetch(`${API_BASE_URL}/addEmployee`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.message === "Email Already Exists") {
            setSnackbar({
              open: true,
              message: "This email is already registered. Try another one.",
              severity: "error",
            });
          } else {
            onAddUser(data.employee);
            setSnackbar({
              open: true,
              message: "User Added Successfully",
              severity: "success",
            });
            dialogClose();
          }
        } else {
          setError(data.message || "Failed to add user");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <DialogBox
        title={selectedUser ? "Edit User" : "Add User"}
        description=""
        isVisible={openDialog}
        onClose={dialogClose}
        onSubmit={handleSubmit}
        cancelText="Cancel"
        confirmText={selectedUser ? "Save Changes" : "Add User"}
        confirmDisabled={isSubmitting} // Disable button while submitting
      >
        <div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded mb-2"
            disabled={isSubmitting}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border p-2 rounded mb-2"
            disabled={isSubmitting}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border p-2 rounded mb-2"
            disabled={isSubmitting}
          >
            <option value="">Select Role</option>
            <option value="HR">HR</option>
            <option value="Accounts">Accountant</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </DialogBox>

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
    </>
  );
}

export default AddUser;
