import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../../../../store/useAuthStore";
import CircularProgress from "@mui/material/CircularProgress";
import Loading from "../../../../../Components/Loading";

import { API_BASE_URL } from "../../../../../config/api";

const AccountHeader = ({
  accountName = "Unknown Account",
  accountType = "Unknown Type",
  ytp = "0",
}) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Account Name: {accountName}</h1>
        <p className="text-gray-700">Type: {accountType}</p>
        <p className="text-gray-700">YTD: {ytp}</p>
      </div>
      <div className="space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Edit Account
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Delete Account
        </button>
      </div>
    </div>
  );
};

const TransactionTable = ({
  accountName,
  accountType,
  setYtpValue,
  accountCode,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [expenseResponse, incomeResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/getAllExpense`, { headers }),
          axios.get(`${API_BASE_URL}/getallIncomes`, { headers }),
        ]);

        // Log raw data for debugging
        console.log("Expense Response:", expenseResponse.data);
        console.log("Income Response:", incomeResponse.data);

        const expensesData = expenseResponse.data?.expenses || [];
        const incomesData = incomeResponse.data?.incomes || [];

        const safeString = (str) => (str ? str.toLowerCase() : "");

        // Filter and map expenses
        const filteredExpenses = expensesData
          .filter(
            (expense) =>
              safeString(expense.subheader) ===
                safeString(`${accountCode}-${accountName}`) &&
              safeString(expense.header) === safeString(accountType)
          )
          .map((expense) => ({
            ...expense,
            debit: expense.amount || 0,
            credit: 0,
          }));

        // Filter and map incomes
        const filteredIncomes = incomesData
          .filter(
            (income) =>
              safeString(income.subheader) ===
                safeString(`${accountCode}-${accountName}`) &&
              safeString(income.header) === safeString(accountType)
          )
          .map((income) => ({
            ...income,
            debit: 0,
            credit: income.amount || 0,
          }));

        // Debug filtered results
        console.log("Filtered Expenses:", filteredExpenses);
        console.log("Filtered Incomes:", filteredIncomes);

        // Combine transactions
        const combinedTransactions = [...filteredExpenses, ...filteredIncomes];
        setTransactions(combinedTransactions);

        // Calculate YTP
        const totalDebit = combinedTransactions.reduce(
          (sum, txn) => sum + txn.debit,
          0
        );
        const totalCredit = combinedTransactions.reduce(
          (sum, txn) => sum + txn.credit,
          0
        );
        const ytp =
          totalDebit > totalCredit
            ? `${totalDebit - totalCredit} Dr`
            : `${totalCredit - totalDebit} Cr`;

        // Update parent YTP value
        setYtpValue(ytp);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountName, accountType, token, setYtpValue, accountCode]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return <Loading />;
  }
  if (error) return <p>{error}</p>;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="transactions table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((txn) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={txn.id || txn.date}
                >
                  <TableCell>
                    {new Date(txn.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell align="right">{txn.debit.toFixed(2)}</TableCell>
                  <TableCell align="right">{txn.credit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

const TransactionRecordPage = () => {
  const location = useLocation();
  const {
    accountName = "Unknown Account",
    accountType = "Unknown Type",
    accountCode = "Unknown Accountcode",
  } = location.state || {};
  const [ytpValue, setYtpValue] = useState("0");

  return (
    <div className="container mx-auto p-6">
      <AccountHeader
        accountName={accountName}
        accountType={accountType}
        ytp={ytpValue}
      />
      <TransactionTable
        accountName={accountName}
        accountType={accountType}
        setYtpValue={setYtpValue}
        accountCode={accountCode}
      />
    </div>
  );
};

export default TransactionRecordPage;
