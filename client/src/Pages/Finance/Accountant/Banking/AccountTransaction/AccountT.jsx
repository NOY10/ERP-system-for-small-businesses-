import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import EnhancedTable from "../../../../../Components/EnhancedTable";

function AccountT() {
  const headCells = [
    { id: "date", disablePadding: true, label: "Date" },
    { id: "type", disablePadding: false, label: "Type" },
    { id: "payee", disablePadding: false, label: "Payee" },
    { id: "debit", disablePadding: false, label: "Debit" },
    { id: "credit", disablePadding: false, label: "Credit" },
    { id: "status", disablePadding: false, label: "Status" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = process.env.REACT_APP_TOKEN_KEY;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true); // Set loading to true when fetch starts
        // const response = await fetch("/bankS.json", {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        const response = await fetch("/bankS.json");
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        const data = await response.json();
        console.log(data);
        const BankStatements = data.bankStatement;
        const formattedData = BankStatements.map((BankStatement, index) => ({
          id: index,
          date: BankStatement.date,
          type: BankStatement.type,
          payee: BankStatement.payee,
          debit: BankStatement.debit,
          credit: BankStatement.credit,
          status: BankStatement.status,
        }));

        setRows(formattedData); // Set the fetched data to rows
      } catch (error) {
        console.error("Error fetching expenses: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchExpenses();
  }, [token]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteExpenses = async (selectedIds) => {
    try {
      const response = await fetch("/bankS.json", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete expenses");
      }

      // Remove deleted rows from the local state
      const updatedRows = rows.filter((row) => !selectedIds.includes(row.id));
      setRows(updatedRows);

      // Show success Snackbar
      setSnackbar({
        open: true,
        message: "Expenses deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting expenses:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete expenses",
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AccountT;
