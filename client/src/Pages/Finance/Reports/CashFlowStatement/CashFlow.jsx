import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import useAuthStore from "../../../../store/useAuthStore";
import DateRange from "../DateRange";
import ParentCF from "./ParentCF";

import { API_BASE_URL } from "../../../../config/api";

const CashFlow = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState([]);
  const [cashFlow, setCashFlow] = useState({ inflow: 0, outflow: 0, net: 0 });

  const { token } = useAuthStore();

  const handleFilteredDataChange = ({ comparisonData }) => {
    setComparisonData(comparisonData);
  };

  const calculateCashFlow = (data) => {
    let inflow = 0;
    let outflow = 0;

    data.forEach((item) => {
      if (item.type === "income") {
        inflow += item.amount;
      } else if (item.type === "expense") {
        outflow += item.amount;
      }
    });

    const net = inflow - outflow;
    setCashFlow({ inflow, outflow, net });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchOptions = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const incomeResponse = await fetch(
          `${API_BASE_URL}/getallIncomes`,
          fetchOptions
        );
        const expenseResponse = await fetch(
          `${API_BASE_URL}/getAllExpense`,
          fetchOptions
        );

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const incomeResult = await incomeResponse.json();
        const expenseResult = await expenseResponse.json();

        const combinedData = [
          ...incomeResult.incomes.map((income) => ({
            ...income,
            type: "income",
          })),
          ...expenseResult.expenses.map((expense) => ({
            ...expense,
            type: "expense",
          })),
        ];

        setDatas(combinedData);
        calculateCashFlow(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-white">
        <CircularProgress size={50} sx={{ color: "rgba(74, 144, 226, 1)" }} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <DateRange
        onFilteredDataChange={handleFilteredDataChange}
        datas={datas}
      />
      <ParentCF comparisonData={comparisonData} combinedData={datas} />
      <div className="mt-8 p-4 bg-gray-100 rounded shadow-lg">
      
        <div className="mt-4">
          <p className="text-gray-600">
            <strong>Total Inflow:</strong> Nu. {cashFlow.inflow.toLocaleString()}
          </p>
          <p className="text-gray-600">
            <strong>Total Outflow:</strong> Nu. {cashFlow.outflow.toLocaleString()}
          </p>
          <p className={`text-lg font-bold ${cashFlow.net >= 0 ? "text-green-600" : "text-red-600"}`}>
            <strong>Net Cash Flow:</strong> Nu. {cashFlow.net.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
