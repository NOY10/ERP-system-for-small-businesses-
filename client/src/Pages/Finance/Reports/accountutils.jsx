import axios from "axios";

import { API_BASE_URL } from "../../../config/api";

const safeString = (str) =>
  typeof str === "string" ? str.toLowerCase().trim() : "";

export const fetchAndCalculateYTD = async (
  dateRange,
  token,
  onAccountsUpdate
) => {
  try {
    const startDate = dateRange.startDate
      ? new Date(dateRange.startDate)
      : null;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

    if (!startDate || !endDate) {
      throw new Error("Invalid date range");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Fetch accounts, expenses, and incomes
    const [accountResponse, expenseResponse, incomeResponse] =
      await Promise.all([
        axios.get(`${API_BASE_URL}/getAllAccounts`, { headers }),
        axios.get(`${API_BASE_URL}/getAllExpense`, { headers }),
        axios.get(`${API_BASE_URL}/getAllIncomes`, { headers }),
      ]);

    const accounts = accountResponse.data?.accounts || [];
    const expenses = expenseResponse.data?.expenses || [];
    const incomes = incomeResponse.data?.incomes || [];

    // Filter expenses and incomes by date range
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const filteredIncomes = incomes.filter((income) => {
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });

    // Map expenses and incomes to accounts
    const updatedAccounts = accounts.map((account) => {
      const totalDebit = filteredExpenses
        .filter(
          (expense) =>
            safeString(expense.subheader) === safeString(account.name) &&
            safeString(expense.header) === safeString(account.type)
        )
        .reduce((sum, txn) => sum + txn.amount, 0);

      const totalCredit = filteredIncomes
        .filter(
          (income) =>
            safeString(income.subheader) === safeString(account.name) &&
            safeString(income.header) === safeString(account.type)
        )
        .reduce((sum, txn) => sum + txn.amount, 0);

      const ytd =
        totalDebit === totalCredit
          ? "0.0"
          : totalDebit > totalCredit
          ? `${(totalDebit - totalCredit).toFixed(2)} Dr`
          : `${(totalCredit - totalDebit).toFixed(2)} Cr`;

      return { ...account, ytd };
    });

    if (onAccountsUpdate) {
      onAccountsUpdate(updatedAccounts);
    }

    return updatedAccounts; // Return updated accounts if needed
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    throw error;
  }
};
