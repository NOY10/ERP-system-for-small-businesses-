import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import EnhancedTable from "../../../../Components/EnhancedTable";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../../store/useAuthStore";
import { API_BASE_URL } from "../../../../config/api";

function JournalList() {
  const headCells = [
    { id: "narration", disablePadding: false, label: "Narration" },
    { id: "date", disablePadding: true, label: "Date" },
    { id: "debit", disablePadding: false, label: "Debit" },
    { id: "credit", disablePadding: false, label: "Credit" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const onRowClick = (row) => {
    // Use the 'id' of the individual row, not 'journalId'
    navigate(`/ManualJournal/View/${row.id}`);
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/getAllJournals`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Journal");
        }

        const responseData = await response.json(); // Assuming the response has a `data` property
        // console.log(responseData);

        const formattedData = responseData.data.map((entry) => ({
          id: entry._id || "",
          date: entry.date,
          narration: entry.narration,
          debit: entry.creditTotal,
          credit: entry.debitTotal,
        }));

        setRows(formattedData);
      } catch (error) {
        console.error("Error fetching journal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [token]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteExpenses = async (selectedIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteJournals`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ journalIDs: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete Journal");
      }

      // Remove deleted rows from the local state
      const updatedRows = rows.filter((row) => !selectedIds.includes(row.id));
      setRows(updatedRows);

      // Show success Snackbar
      setSnackbar({
        open: true,
        message: "Journal deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting Journal:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete Journal",
        severity: "error",
      });
    }
  };
  return (
    <div>
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
        <div className="mb-2">
          <EnhancedTable
            rows={rows}
            headCells={headCells}
            onDelete={handleDeleteExpenses}
            onEditBtn={false}
            onRowClick={onRowClick}
          />
        </div>
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
}

export default JournalList;
