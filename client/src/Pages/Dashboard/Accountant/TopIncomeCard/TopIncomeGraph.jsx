import { PieChart } from "@mui/x-charts/PieChart";
import React, { memo, useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";

import { API_BASE_URL } from "../../../../config/api";

function TopIncomeGraph({ yearDropDown }) {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [bottomMargin, setBottomMargin] = useState(50);
  const { token } = useAuthStore(); // Default margin

  // console.log("Dropdown Selection:", yearDropDown);

  // Dynamically update bottom margin based on screen size
  useEffect(() => {
    const updateMargin = () => {
      const screenWidth = window.innerWidth;
      setBottomMargin(screenWidth < 768 ? 100 : 50);
    };
    updateMargin();
    window.addEventListener("resize", updateMargin);

    return () => window.removeEventListener("resize", updateMargin);
  }, []);

  // Filter data based on dropdown value
  const filterDataByDropdown = (data, dropdown) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const getStartOfFiscalYear = (year) => new Date(year, 0, 1);
    const getEndOfFiscalYear = (year) => new Date(year + 1, 0, 0);
    const getStartOfMonth = (year, month) => new Date(year, month, 1);
    const getEndOfMonth = (year, month) => new Date(year, month + 1, 0);

    const getStartOf12MonthsAgo = () => {
      const d = new Date(today);
      d.setFullYear(today.getFullYear() - 1);
      d.setDate(1); // Ensure it starts at the first day of the month
      return d;
    };

    const getStartOf6MonthsAgo = () => {
      const d = new Date(today);
      d.setMonth(today.getMonth() - 6);
      d.setDate(1);
      return d;
    };

    const getStartOfThisWeek = () => {
      const d = new Date(today);
      const dayOfWeek = d.getDay(); // Sunday = 0, Monday = 1, etc.
      d.setDate(currentDay - dayOfWeek);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const ranges = {
      "This Fiscal Year": {
        start: getStartOfFiscalYear(currentYear),
        end: getEndOfFiscalYear(currentYear),
      },
      "Previous Fiscal Year": {
        start: getStartOfFiscalYear(currentYear - 1),
        end: getEndOfFiscalYear(currentYear - 1),
      },
      "Last 12 Months": {
        start: getStartOf12MonthsAgo(),
        end: today,
      },
      "Last 6 Months": {
        start: getStartOf6MonthsAgo(),
        end: today,
      },
      "This Week": {
        start: getStartOfThisWeek(),
        end: today,
      },
      "This Month": {
        start: getStartOfMonth(currentYear, currentMonth),
        end: getEndOfMonth(currentYear, currentMonth),
      },
    };

    if (!ranges[dropdown]) {
      return data;
    }

    const { start, end } = ranges[dropdown];

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/getallIncomes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const incomeData = await response.json();
        const FilteredIncome = incomeData.incomes.filter(
          (income) =>
            income.header === "Revenue" ||
            income.header === "Sales" ||
            income.header === "Other Income"
        );

        const incomeList = FilteredIncome || [];

        // console.log("Fetched incomes:", incomeList);

        const filteredIncome = filterDataByDropdown(incomeList, yearDropDown);
        // console.log("Filtered incomes:", filteredIncome);

        setIncome(filteredIncome);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [yearDropDown, token]);

  // Group data by category
  const groupDataByCategory = (data) => {
    const validData = data.map((item) => ({
      category: item.subheader || "Unknown",
      amount: item.amount || 0,
      date: item.date,
    }));

    const categoryMap = {};
    validData.forEach((item) => {
      if (item.amount > 0) {
        categoryMap[item.category] =
          (categoryMap[item.category] || 0) + item.amount;
      }
    });

    const totalAmount = Object.values(categoryMap).reduce(
      (sum, value) => sum + value,
      0
    );

    const colorPalette = ["#0D647F", "#11CED0", "#1A92E5", "#2A2259"];

    const groupedData = Object.entries(categoryMap)
      .map(([key, value], id) => ({
        id,
        value,
        label: `${key} (${((value / totalAmount) * 100).toFixed(2)}%)`,
        color: colorPalette[id % colorPalette.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return groupedData;
  };
  const chartData = groupDataByCategory(income);

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center mt-2">
          <div className="relative w-64 h-64 rounded-full bg-gray-200">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute top-0 left-0 w-1/2 h-1/2 bg-gray-${
                  100 + ((i * 100) % 400)
                } rounded-tl-full animate-pulse transform rotate-${
                  i * 60
                }deg origin-bottom-right`}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <PieChart
            margin={{ top: 10, bottom: bottomMargin, left: 10, right: 10 }}
            series={[
              {
                data: chartData,
                cornerRadius: 4,
              },
            ]}
            height={280}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "bottom", horizontal: "middle" },
                padding: -4,
                itemMarkWidth: 13,
                itemMarkHeight: 14,
                markGap: 6,
                itemGap: 9,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(TopIncomeGraph);
