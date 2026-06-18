import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../../../Components/EnhancedTable";
import IncomeHeader from "../../../Components/IncomeHeader";
import RecievableSummary from "../../../Components/RecievableSummary";
import useAuthStore from "../../../store/useAuthStore";

import { API_BASE_URL } from "../../../config/api";

const headCells = [
  { id: "header", numeric: true, disablePadding: true, label: "Income Header" },
  { id: "subheader", numeric: true, disablePadding: true, label: "Income Subheader" },
  { id: "amount", numeric: true, disablePadding: false, label: "Amount (Nu)" },
  {
    id: "description",
    numeric: false,
    disablePadding: false,
    label: "Description",
  },
  { id: "date", numeric: true, disablePadding: false, label: "Date" },
];

const Income = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setLoading(true); // Set loading to true when fetch starts
        const response = await fetch(`${API_BASE_URL}/getallIncomes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Incomes");
        }

        const data = await response.json();
        const formattedData = data.incomes.map((income) => ({
          id: income._id,
          header: income.header,
          subheader: income.subheader,
          amount: income.amount,
          description: income.description,
          date: income.date,
        }));

        setRows(formattedData); // Set the fetched data to rows
      } catch (error) {
        console.error("Error fetching incomes: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchIncomes();
  }, [token]);

  // Filter rows based on the selected date range
  const filterRowsByDate = (rows) => {
    if (!startDate || !endDate) return rows; // Show all rows if no valid date range is selected
    return rows.filter((row) => {
      const rowDate = new Date(row.date);
      return rowDate >= startDate && rowDate <= endDate;
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleEdit = (row) => {
    navigate("/editIncome", { state: { row } });
  };
  const handleDeleteIncomes = async (selectedIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteIncome`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete Incomes");
      }

      // Remove deleted rows from the local state
      const updatedRows = rows.filter((row) => !selectedIds.includes(row.id));
      setRows(updatedRows);

      // Show success Snackbar
      setSnackbar({
        open: true,
        message: "Incomes deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting Incomes:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete Incomes",
        severity: "error",
      });
    }
  };

  const filteredRows = filterRowsByDate(rows);

  return (
    <div>
      <IncomeHeader className="mb-4" />

      {/* Show loading skeleton if loading is true */}
      {loading ? (
        <div className="flex flex-col space-y-4 mt-8">
          <div className="animate-pulse space-y-2">
            <div className="bg-gray-300 h-6 w-1/4 rounded"></div>
            <div className="bg-gray-300 h-8 w-full rounded"></div>
            <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
            <div className="bg-gray-300 h-8 w-5/6 rounded"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse rounded-full h-10 w-10 bg-gray-300"></div>
          </div>
        </div>
      ) : (
        <>
          <RecievableSummary
            className="mb-4"
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            visibleRows={filteredRows}
            headCells={headCells}
          />
          <EnhancedTable
            rows={filteredRows}
            headCells={headCells}
            onDelete={handleDeleteIncomes}
            onEdit={handleEdit} 
          />
        </>
      )}

      {/* Snackbar for delete success or error */}
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
};

export default Income;
