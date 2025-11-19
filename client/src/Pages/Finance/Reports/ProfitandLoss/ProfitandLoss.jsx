import React, { useEffect, useState } from "react";
import ProfitAndLossStatement from "./ProfitAndLossStatement";
import DateRange from "../DateRange";
import useAuthStore from "../../../../store/useAuthStore";
import { SlidingCubeLoader } from "react-loaders-kit";

const ParentComponent = () => {
  const [ComparisonData, setComparisonData] = useState([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState([]);

  const { token } = useAuthStore();

  const handleFilteredDataChange = ({ comparisonData }) => {
    setComparisonData(comparisonData);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <DateRange
        onFilteredDataChange={handleFilteredDataChange}
        datas={datas}
        // setLoading={setLoading}
        // loading={loading}
      />
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <SlidingCubeLoader
            loading={true}
            size={50}
            colors={["#2887D4BE", "#0976C3BE"]}
            duration={1}
          />
        </div>
      ) : (
        <ProfitAndLossStatement comparisonData={ComparisonData} />
      )}
    </div>
  );
};

export default ParentComponent;
