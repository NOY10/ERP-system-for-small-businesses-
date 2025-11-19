import React, { useEffect, useState } from "react";
import { SlidingCubeLoader } from "react-loaders-kit";
import useAuthStore from "../../../../store/useAuthStore";
import DateRange from "../DateRange";
import ParentBS from "./ParentBS";

const BalanceSheet = () => {
  const [comparisonData, setComparisonData] = useState([]); // Updated state variable
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState([]);

  const { token } = useAuthStore();

  const handleFilteredDataChange = ({ comparisonData }) => {
    setComparisonData(comparisonData); // Set the correct state
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
          "http://localhost:8000/getallIncomes",
          fetchOptions
        );
        const expenseResponse = await fetch(
          "http://localhost:8000/getAllExpense",
          fetchOptions
        );

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const incomeResult = await incomeResponse.json();
        const expenseResult = await expenseResponse.json();

        // Combine incomes and expenses into a single array
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

        // console.log("combinedData", combinedData);
        setDatas(combinedData);
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
        <SlidingCubeLoader
          loading={true}
          size={50}
          color="rgba(74, 144, 226, 1)"
        />
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
      <ParentBS comparisonData={comparisonData} combinedData={datas} />{" "}
      {/* Ensure prop matches the state variable */}
    </div>
  );
};

export default BalanceSheet;
