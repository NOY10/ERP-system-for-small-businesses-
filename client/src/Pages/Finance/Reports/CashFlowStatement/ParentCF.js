import axios from "axios";
import React, { useEffect, useState } from "react";
import { SlidingCubeLoader } from "react-loaders-kit";
import useAuthStore from "../../../../store/useAuthStore";
import CashFlowTable from "./CashFlowStatement";

const safeString = (str) => (typeof str === "string" ? str.toLowerCase().trim() : "");

function ParentCF({ comparisonData, combinedData }) {
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
          axios.get("http://localhost:8000/getAllAccounts", { headers }),
        ]);

        setAccounts(accountResponse.data?.accounts || []);
        setError(""); // Clear error if data fetch is successful
      } catch (err) {
        setError("Error fetching data. Please try again.");
      } finally {
        setLoading(false);
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

  const calculateCashFlows = () => {
    return filteredData.map((data) => {
      const { period } = data;
      const [startDate, endDate] = period;

      const accountBalances = accounts.map((account) => {
        const inflows = combinedData
          .filter(
            (income) =>
              income.type === "income" &&
              safeString(income.subheader) === safeString(`${account.code}-${account.name}`) &&
              new Date(income.date) >= new Date(startDate) &&
              new Date(income.date) <= new Date(endDate)
          )
          .reduce((sum, income) => sum + income.amount, 0);

        const outflows = combinedData
          .filter(
            (expense) =>
              expense.type === "expense" &&
              safeString(expense.subheader) === safeString(`${account.code}-${account.name}`) &&
              new Date(expense.date) >= new Date(startDate) &&
              new Date(expense.date) <= new Date(endDate)
          )
          .reduce((sum, expense) => sum + expense.amount, 0);

        return {
          ...account,
          inflows,
          outflows,
          netFlow: inflows - outflows,
          category: getAccountCategory(account.type),
        };
      });

      return {
        date: period,
        data: accountBalances,
      };
    });
  };

  const filteredAccounts = calculateCashFlows();

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-2">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-200 to-white">
          <SlidingCubeLoader
            loading={true}
            size={50}
            colors={["#2887D4BE", "#0976C3BE"]}
            duration={2}
          />
        </div>
      ) : (
        <CashFlowTable
  data={filteredAccounts.map((item) => ({
    date: item.date,
    data: item.data.map((account) => ({
      accountName: account.name,
      category: getAccountCategory(account.type),
      inflows: account.inflows || 0,
      outflows: account.outflows || 0,
      netFlow: account.netFlow || 0,
    })),
  }))}
/>

      )}
    </div>
  );
}

// Helper function to categorize account types
const getAccountCategory = (type = "") => {
  const lowerType = safeString(type);

  if (
    lowerType.includes("revenue") ||
    lowerType.includes("sales") ||
    lowerType.includes("other income") ||
    lowerType.includes("cost of goods sold") ||
    lowerType.includes("operating expenses") ||
    lowerType.includes("direct expenses") 
  )
    return "Operating Activities";

  if (lowerType.includes("non-current asset")) return "Investing Activities";

  if (lowerType.includes("non-current liability") || lowerType.includes("equity"))
    return "Financing Activities";

  return "Other Activities";
};

export default ParentCF;
