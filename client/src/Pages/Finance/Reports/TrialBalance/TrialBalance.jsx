import { arrayMove } from "@dnd-kit/sortable";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import useAuthStore from "../../../../store/useAuthStore";
import DateRange from "./DateRangeSelector";
import Modal from "./Modal";

import { API_BASE_URL } from "../../../../config/api";

const safeString = (str) =>
  typeof str === "string" ? str.toLowerCase().trim() : "";

const TrialBalance = () => {
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0 });
  const [columns, setColumns] = useState([
    { id: "code", label: "Account Code" },
    { id: "name", label: "Account Name" },
    { id: "type", label: "Account Type" },
    { id: "debit", label: "Debit" },
    { id: "credit", label: "Credit" },
  ]);
  const { token } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [accountResponse, expenseResponse, incomeResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/getAllAccounts`, { headers }),
            axios.get(`${API_BASE_URL}/getAllExpense`, { headers }),
            axios.get(`${API_BASE_URL}/getAllIncomes`, { headers }),
          ]);

        const accountsData = accountResponse.data?.accounts || [];
        const updatedAccounts = accountsData.map((account) => ({
          ...account,
          ytd: "0.0",
        }));

        setAccounts(updatedAccounts);
        setExpenses(expenseResponse.data?.expenses || []);
        setIncomes(incomeResponse.data?.incomes || []);
        setFilteredAccounts(updatedAccounts);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [token]);

  const updateFilteredData = async ({ startDate, endDate }) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (!start || !end) return;

    setLoading(true);
    setDateRangeText(
      `From ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`
    );

    try {
      const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
      });

      const filteredIncomes = incomes.filter((income) => {
        const incomeDate = new Date(income.date);
        return incomeDate >= start && incomeDate <= end;
      });

      const updatedAccounts = accounts.map((account) => {
        const totalDebit = filteredExpenses
          .filter(
            (expense) =>
              safeString(expense.subheader) ===
                safeString(`${account.code}-${account.name}`) &&
              safeString(expense.header) === safeString(account.type)
          )
          .reduce((sum, txn) => sum + txn.amount, 0);

        const totalCredit = filteredIncomes
          .filter(
            (income) =>
              safeString(income.subheader) ===
                safeString(`${account.code}-${account.name}`) &&
              safeString(income.header) === safeString(account.type)
          )
          .reduce((sum, txn) => sum + txn.amount, 0);

        const ytd =
          totalDebit === totalCredit
            ? "0.0"
            : totalDebit > totalCredit
            ? `${(totalDebit - totalCredit).toFixed(2)} Dr`
            : `${(totalCredit - totalDebit).toFixed(2)} Cr`;

        return { ...account, ytd: ytd || "0.0" };
      });

      setFilteredAccounts(updatedAccounts);

      let totalDebit = 0;
      let totalCredit = 0;

      updatedAccounts.forEach((account) => {
        const ytdValue = account.ytd || "0.0";
        const value = parseFloat(ytdValue);
        if (ytdValue.toLowerCase().endsWith("dr")) {
          totalDebit += value;
        } else if (ytdValue.toLowerCase().endsWith("cr")) {
          totalCredit += value;
        }
      });

      setTotals({ totalDebit, totalCredit });
    } catch (error) {
      console.error("Error updating filtered data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const isTotalHeadingVisible =
    ![columns[0]?.id, columns[1]?.id].includes("debit") &&
    ![columns[0]?.id, columns[1]?.id].includes("credit");

  return (
    <div className="bg-white p-3">
      <h1 className="text-xl font-extrabold text-gray-900">Trial Balance</h1>
      <h2 className="text-center font-medium text-gray-500 m-3">
        {dateRangeText || "Select a date range to view."}
      </h2>

      <DateRange
        onFilteredDataChange={updateFilteredData}
        setLoading={setLoading}
        loading={loading}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <CircularProgress size={50} sx={{ color: "rgba(74, 144, 226, 1)" }} />
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Reorder Columns
          </button>
          <Modal
            columns={columns}
            isModalVisible={isModalVisible}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (active.id !== over.id) {
                setColumns((prevColumns) => {
                  const oldIndex = prevColumns.findIndex(
                    (col) => col.id === active.id
                  );
                  const newIndex = prevColumns.findIndex(
                    (col) => col.id === over.id
                  );
                  return arrayMove(prevColumns, oldIndex, newIndex);
                });
              }
            }}
            onApplyChanges={() => setIsModalVisible(false)}
            onCancel={() => setIsModalVisible(false)}
          />

          <table className="table-auto border-collapse w-full mt-4">
            <thead>
              <tr className="border-b border-gray-400">
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-2 text-left">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts
                  .filter((account) => {
                    const debit = parseFloat(
                      account.ytd.toLowerCase().endsWith("dr")
                        ? account.ytd
                        : "0.0"
                    );
                    const credit = parseFloat(
                      account.ytd.toLowerCase().endsWith("cr")
                        ? account.ytd
                        : "0.0"
                    );
                    return debit !== 0 || credit !== 0;
                  })
                  .map((account, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className={`px-4 py-2 ${
                            col.id === "debit" || col.id === "credit"
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {col.id === "code"
                            ? account.code || "N/A"
                            : col.id === "name"
                            ? account.name
                            : col.id === "type"
                            ? account.type
                            : col.id === "debit"
                            ? parseFloat(
                                account.ytd.toLowerCase().endsWith("dr")
                                  ? account.ytd
                                  : "0.0"
                              ).toFixed(2)
                            : col.id === "credit"
                            ? parseFloat(
                                account.ytd.toLowerCase().endsWith("cr")
                                  ? account.ytd
                                  : "0.0"
                              ).toFixed(2)
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-2 text-center"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
            {isTotalHeadingVisible && (
              <tfoot>
                <tr className="border-t border-gray-400 font-bold">
                  <td colSpan={columns.length - 2} className="px-4 py-2">
                    Total
                  </td>
                  <td className="px-4 py-2 text-right">
                    {totals.totalDebit.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {totals.totalCredit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </>
      )}
    </div>
  );
};

export default TrialBalance;
