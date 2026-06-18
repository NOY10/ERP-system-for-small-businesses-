import axios from "axios";
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

// import ReportHeader from "../TrialBalance/DateRangeSelector";
import useAuthStore from "../../../../store/useAuthStore";
import BalanceSheetTable from "./BalanceSheetTable";

import { API_BASE_URL } from "../../../../config/api";

const safeString = (str) =>
  typeof str === "string" ? str.toLowerCase().trim() : "";

function ParentBS({ comparisonData, combinedData }) {
  const [accounts, setAccounts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [accountResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/getAllAccounts`, { headers }),
        ]);

        setAccounts(accountResponse.data?.accounts || []);

        setError(""); // Clear error if data fetch is successful
      } catch (err) {
        setError("Error fetching data. Please try again.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000); // Minimum loader duration
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (comparisonData?.length > 0) {
      setFilteredData(comparisonData);
    } else {
      setFilteredData([]);
    }
  }, [comparisonData]);

  const calculateBalances = () => {
    return filteredData.map((data) => {
      const { period } = data;
      const [startDate, endDate] = period;
  
      const today = new Date();
      const currentYear = today.getFullYear();
      const rangeStartYear = startDate
        ? new Date(startDate).getFullYear()
        : currentYear;
      const rangeEndYear = endDate
        ? new Date(endDate).getFullYear()
        : currentYear;
  
      const accountBalances = accounts.map((account) => {
        let openingBalance = 0;
        let yearlyBalances = [];
  
        for (let year = currentYear - 10; year <= rangeEndYear; year++) {
          const yearStart = new Date(year, 0, 1); // Start of the year
          const yearEnd = new Date(year, 11, 31); // End of the year
  
          const rangeStart = year === rangeStartYear ? new Date(startDate) : yearStart;
          const rangeEnd = year === rangeEndYear ? new Date(endDate) : yearEnd;
  
          const yearExpenses = combinedData.filter(
            (expense) =>
              safeString(expense.subheader) ===
                safeString(`${account.code}-${account.name}`) &&
              safeString(expense.header) === safeString(account.type) &&
              expense.type === "expense" &&
              new Date(expense.date) >= rangeStart &&
              new Date(expense.date) <= rangeEnd
          );
  
          const yearIncomes = combinedData.filter(
            (income) =>
              safeString(income.subheader) ===
                safeString(`${account.code}-${account.name}`) &&
              safeString(income.header) === safeString(account.type) &&
              income.type === "income" &&
              new Date(income.date) >= rangeStart &&
              new Date(income.date) <= rangeEnd
          );
  
          const totalDebits = yearExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );
          const totalCredits = yearIncomes.reduce(
            (sum, income) => sum + income.amount,
            0
          );
  
          const closingBalance = openingBalance + totalCredits - totalDebits;
  
          yearlyBalances.push({
            year,
            rangeStart: rangeStart.toISOString(),
            rangeEnd: rangeEnd.toISOString(),
            openingBalance,
            totalDebits,
            totalCredits,
            closingBalance,
          });
  
          openingBalance = closingBalance;
        }
  
        const filteredYearlyBalances = yearlyBalances.filter(
          (yearData) =>
            new Date(yearData.rangeStart) >= new Date(startDate) &&
            new Date(yearData.rangeEnd) <= new Date(endDate)
        );
  
        const totalDebits = filteredYearlyBalances.reduce(
          (sum, year) => sum + year.totalDebits,
          0
        );
        const totalCredits = filteredYearlyBalances.reduce(
          (sum, year) => sum + year.totalCredits,
          0
        );
  
        const requestedOpeningBalance =
          filteredYearlyBalances[0]?.openingBalance || 0;
  
        const requestedClosingBalance =
          filteredYearlyBalances[filteredYearlyBalances.length - 1]
            ?.closingBalance || 0;
  
        return {
          ...account,
          yearlyBalances,
          openingBalance: requestedOpeningBalance,
          closingBalance: requestedClosingBalance,
          totalDebit: totalDebits,
          totalCredit: totalCredits,
        };
      });
  
      return {
        date: period,
        data: accountBalances,
      };
    });
  };
  

  const filteredAccounts = calculateBalances();

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-2">
      {/* <ReportHeader
        onFilteredDataChange={setFilteredData}
        setLoading={setLoading}
        loading={loading}
      /> */}

      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-200 to-white">
          <CircularProgress size={50} sx={{ color: "rgba(74, 144, 226, 1)" }} />
        </div>
      ) : (
        <BalanceSheetTable
          data={filteredAccounts.map((item) => ({
            date: item.date,
            data: item.data.map((account) => ({
              accountName: account.name,
              accountType: getAccountType(account.type),
              category: getAccountCategory(account.type),
              balance: account.closingBalance || 0, // Use closingBalance or default to 0 if undefined
            })),
          }))}
        />
      )}
    </div>
  );
}

// Helper functions to categorize account types
const getAccountType = (type) => {
  if (type.toLowerCase().includes("asset")) return "Asset";
  if (type.toLowerCase().includes("liability")) return "Liability";
  if (type.toLowerCase().includes("equity")) return "Equity";
  return "Other";
};

const getAccountCategory = (type) => {
  // Return "Current" first since "current" also exists in "non-current"
  if (type.toLowerCase().includes("current") && !type.toLowerCase().includes("non-current")) return "Current";
  if (type.toLowerCase().includes("non-current")) return "Non-Current";
  return "Other";
};

export default ParentBS;
