import axios from "axios";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DialogBox from "../../../../Components/Dialogbox";
import useAuthStore from "../../../../store/useAuthStore";
import AddAccount from "./AddAccount";
import { Alert, Snackbar } from "@mui/material";

function AccountTable({ rows, actions }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowDataToEdit, setRowDataToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rowsWithYTD, setRowsWithYTD] = useState([]);
  const { token } = useAuthStore();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });
        
      
        const handleSnackbarClose = () => {
          setSnackbar({ ...snackbar, open: false });
        };

  useEffect(() => {
    const fetchAndCalculateYTD = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const updatedRows = await Promise.all(
          rows.map(async (row) => {
            const { name, type, code } = row;
            try {
              const [expenseResponse, incomeResponse] = await Promise.all([
                axios.get("http://localhost:8000/getAllExpense", { headers }),
                axios.get("http://localhost:8000/getallIncomes", { headers }),
              ]);

              const expenses = expenseResponse.data?.expenses || [];
              const incomes = incomeResponse.data?.incomes || [];

              const safeString = (str) => (str ? str.toLowerCase() : "");
              const filteredExpenses = expenses
                .filter(
                  (expense) =>
                    safeString(expense.subheader) ===
                      safeString(`${code}-${name}`) &&
                    safeString(expense.header) === safeString(type)
                )
                .map((expense) => ({
                  debit: expense.amount || 0,
                  credit: 0,
                }));

              const filteredIncomes = incomes
                .filter(
                  (income) =>
                    safeString(income.subheader) ===
                      safeString(`${code}-${name}`) &&
                    safeString(income.header) === safeString(type)
                )
                .map((income) => ({
                  debit: 0,
                  credit: income.amount || 0,
                }));

              const combinedTransactions = [
                ...filteredExpenses,
                ...filteredIncomes,
              ];

              const totalDebit = combinedTransactions.reduce(
                (sum, txn) => sum + txn.debit,
                0
              );
              const totalCredit = combinedTransactions.reduce(
                (sum, txn) => sum + txn.credit,
                0
              );

              const ytd =
                totalDebit === totalCredit
                  ? "0.00"
                  : totalDebit > totalCredit
                  ? `${(totalDebit - totalCredit).toFixed(2)}`
                  : `${(totalCredit - totalDebit).toFixed(2)}`;

              return { ...row, ytd };
            } catch (err) {
              console.error(`Error calculating YTD for row ${row.id}:`, err);
              return { ...row, ytd: "Error" };
            }
          })
        );

        setRowsWithYTD(updatedRows);
      } catch (err) {
        console.error("Error fetching YTD values:", err);
      }
    };

    fetchAndCalculateYTD();
  }, [rows, token]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter rows based on the search query
  const filteredRows = useMemo(
    () =>
      rowsWithYTD.filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [rowsWithYTD, searchQuery]
  );

  // Paginate rows
  const paginatedRows = useMemo(
    () =>
      filteredRows.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [filteredRows, currentPage, rowsPerPage]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Handle delete action
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      return alert("No rows selected to delete");
    }

    try {
      // Make a DELETE request to the backend
      const response = await fetch("http://localhost:8000/deleteAccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedRows }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete accounts");
      }

      const updatedRows = rowsWithYTD.filter(
        (row) => !selectedRows.includes(row._id)
      );
      setRowsWithYTD(updatedRows);
      setSelectedRows([]);
      setSnackbar({
        open: true,
     message:"Account deleted Successfully",
        severity: "success",
      });

      // alert(result.message || "Accounts deleted successfully");
    } catch (err) {
      console.error("Error deleting accounts:", err.message);
      alert(err.message || "An error occurred while deleting accounts");
    }
  };

  // Handle checkbox selection for individual rows
  const handleRowSelect = (rowId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rowId)
        ? prevSelectedRows.filter((_id) => _id !== rowId)
        : [...prevSelectedRows, rowId]
    );
  };

  // Check if all rows on the current page are selected
  const areAllCurrentPageRowsSelected = paginatedRows.every((row) =>
    selectedRows.includes(row._id)
  );

  // Handle select/deselect all rows on the current page
  const handleSelectAll = () => {
    const currentPageRowIds = paginatedRows.map((row) => row._id);

    if (areAllCurrentPageRowsSelected) {
      // Deselect all current page rows
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.filter((_id) => !currentPageRowIds.includes(_id))
      );
    } else {
      // Select all current page rows
      setSelectedRows((prevSelectedRows) => [
        ...new Set([...prevSelectedRows, ...currentPageRowIds]),
      ]);
    }
  };

  // Handle row click to open the edit modal
  const handleRowClick = (rowData) => {
    setRowDataToEdit(rowData);
    setIsEditModalOpen(true);
  };

  // Handle modal close
  const closeModal = () => {
    setIsEditModalOpen(false);
    setRowDataToEdit(null);
  };

  // Handle save in the edit modal
  const handleSave = (updatedData) => {
    console.log("Updated Data:", updatedData);
    closeModal();
  };

  // Pagination navigation
  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleYTDClick = (rowData, event) => {
    event.stopPropagation();
    navigate("/TransactionRecord", {
      state: {
        accountName: rowData.name,
        accountType: rowData.type,
        accountCode: rowData.code,
      },
    });
  };

  return (
    <div className="bg-white p-2">
      {/* Action and Search Row */}
      <div className="flex items-center justify-between mb-2">
        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search across all columns"
            className="px-3 py-1 border border-gray-300 rounded w-64 focus:outline-blue-500"
            aria-label="Search"
          />
        </div>
        {actions && selectedRows.length > 0 && (
          <div className="rounded overflow-hidden">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={
                  action.label === "Delete" ? handleDelete : action.onClick
                }
                className={`flex items-center ${
                  action.label === "Delete"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-black"
                } rounded-md overflow-hidden`}
                aria-label={action.label}
              >
                {/* Left Section */}
                {action.label === "Delete" && (
                  <span className="flex px-3 py-1 text-left font-bold">
                    Delete
                  </span>
                )}

                {/* Right Section */}
                {action.label === "Delete" && (
                  <span className="bg-gray-400 px-3 py-1 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">X</span>
                  </span>
                )}

                {/* Label for other actions */}
                {action.label !== "Delete" && (
                  <span className="px-4 py-2">{action.label}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-1 border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={areAllCurrentPageRowsSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 cursor-pointer"
                  aria-label="Select All Rows"
                />
              </th>
              <th className="px-3 py-2 border-b border-gray-300">Code</th>
              <th className="px-3 py-2 border-b border-gray-300">Name</th>
              <th className="px-3 py-2 border-b border-gray-300">Type</th>
              <th className="px-3 py-2 border-b border-gray-300">Tax Rate</th>
              <th className="px-3 py-2 border-b border-gray-300">YTD</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row._id}>
                  <td className="px-3 py-2 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row._id)}
                      onChange={() => handleRowSelect(row._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </td>
                  <td
                    className="px-3 py-2 border-b border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.code}
                  </td>
                  <td
                    className="px-3 py-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(row)}
                  >
                    {row.name}
                  </td>
                  <td
                    className="px-3 py-2 border-b border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.type}
                  </td>
                  <td
                    className="px-3 py-2 border-b border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.taxRate}
                  </td>
                  <td
                    className="px-3 py-2 border-b border-gray-200 text-blue-500 cursor-pointer hover:underline"
                    onClick={(e) => handleYTDClick(row, e)}
                  >
                    {row.ytd}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center p-1">
        {/* Rows per Page Selector */}
        <div className="flex items-center justify-end mr-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border-r"
            aria-label="Rows per page"
          >
            <option value={15}>15</option>
            <option value={30}>40</option>
            <option value={40}>60</option>
            <option value={50}>100</option>
          </select>
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 0}
            onClick={() => handleChangePage(currentPage - 1)}
            aria-label="Previous Page"
            className="disabled:opacity-50"
          >
            <MdOutlineKeyboardArrowLeft className="text-xl" />
          </button>
          <span>
            Page {currentPage + 1} of{" "}
            {Math.ceil(filteredRows.length / rowsPerPage)}
          </span>
          <button
            disabled={
              currentPage ===
                Math.ceil(filteredRows.length / rowsPerPage) - 1 ||
              filteredRows.length === 0
            }
            onClick={() => handleChangePage(currentPage + 1)}
            aria-label="Next Page"
            className="disabled:opacity-50"
          >
            <MdOutlineKeyboardArrowRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && rowDataToEdit && (
        <div>
          <DialogBox
            title="Edit Account"
            description=""
            isVisible={isEditModalOpen}
            onClose={closeModal}
          >
            <AddAccount
              accountDataToEdit={rowDataToEdit}
              onAddAccount={handleSave}
              isEditing={true}
            />
          </DialogBox>
        </div>
      )}

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

AccountTable.propTypes = {
  rows: PropTypes.array.isRequired,
  actions: PropTypes.array,
};

export default AccountTable;
