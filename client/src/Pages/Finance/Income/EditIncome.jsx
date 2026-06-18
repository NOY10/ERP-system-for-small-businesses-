import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Alert, Button, Snackbar } from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import { API_BASE_URL } from "../../../config/api";

const EditIncome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.row || {}; // Get row data from state
  const [formData, setFormData] = useState(initialData);
  const [successMessage, setSuccessMessage] = useState(false); // State for success message
  const { token } = useAuthStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/updateIncome/${formData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update Income");
      }

      // Show success message
      setSuccessMessage(true);

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/Income");
      }, 2000);
    } catch (error) {
      console.error("Error updating Income: ", error);
      alert("Failed to update Income");
    }
  };

  const handleBack = () => {
    navigate("/Income");
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(false);
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-lg max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center mb-4 text-blue-500 hover:underline"
      >
        <ArrowBackIcon className="mr-2" /> Back
      </button>

      <h2 className="text-3xl font-bold mb-6 justify-center">Edit Income</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2 text-blue-500">
              Income Header
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.header || ""}
              onChange={handleChange}
              disabled
            />
          </div>
          <div>
            <label className="block font-medium mb-2 text-blue-500">
              Income Subheader
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.subheader || ""}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">Date</label>
            <input
              type="date"
              name="date"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date?.split("T")[0] || ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount || ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Description
            </label>
            <textarea
              name="description"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          className="w-full md:w-auto px-6 py-2 align-center"
        >
          Save Changes
        </Button>
      </div>

      {/* Snackbar for success message */}
      <Snackbar
        open={successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%", color:"white", backgroundColor:"#22c55e", "& .MuiAlert-icon": {
        color: "white",
      },}}
        >
          Income updated successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditIncome;
