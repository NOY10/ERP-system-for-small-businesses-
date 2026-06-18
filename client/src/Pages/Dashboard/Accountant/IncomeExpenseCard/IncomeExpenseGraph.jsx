import { BarChart } from "@mui/x-charts/BarChart";
import React, { memo, useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";

import { API_BASE_URL } from "../../../../config/api";

const currentDate = new Date(); // Use real current date

const filterDataByDropdown = (data, dropdown) => {
  if (!Array.isArray(data)) {
    return [];
  }

  const currentYear = currentDate.getFullYear();
  const lastYear = currentYear - 1;

  const startOfThisFiscalYear = new Date(currentYear, 0, 1);
  const startOfLastFiscalYear = new Date(lastYear, 0, 1);
  const startOf12MonthsAgo = new Date(
    new Date(currentDate).setMonth(currentDate.getMonth() - 12)
  );
  const startOf6MonthsAgo = new Date(
    new Date(currentDate).setMonth(currentDate.getMonth() - 6)
  );

  switch (dropdown) {
    case "This Fiscal Year":
      return data.filter(
        (item) => new Date(item.date) >= startOfThisFiscalYear
      );

    case "Previous Fiscal Year":
      return data.filter(
        (item) =>
          new Date(item.date) >= startOfLastFiscalYear &&
          new Date(item.date) < startOfThisFiscalYear
      );

    case "Last 12 Months":
      return data.filter((item) => new Date(item.date) >= startOf12MonthsAgo);

    case "Last 6 Months":
      return data.filter((item) => new Date(item.date) >= startOf6MonthsAgo);

    default:
      return data;
  }
};

const groupDataByMonth = (data, rangeMonths, dropdown) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let startMonthIndex, startYear;
  const currentYear = currentDate.getFullYear();

  switch (dropdown) {
    case "This Fiscal Year":
      startMonthIndex = 0;
      startYear = currentYear;
      break;
    case "Previous Fiscal Year":
      startMonthIndex = 0;
      startYear = currentYear - 1;
      break;
    case "Last 12 Months":
      startMonthIndex = currentDate.getMonth() - 11;
      startYear = currentYear;
      break;
    case "Last 6 Months":
      startMonthIndex = currentDate.getMonth() - 5;
      startYear = currentYear;
      break;
    default:
      startMonthIndex = 0;
      startYear = currentYear;
  }

  const adjustedStartDate = new Date(startYear, startMonthIndex, 1);
  const dynamicMonths = [];

  for (let i = 0; i < rangeMonths; i++) {
    const date = new Date(adjustedStartDate);
    date.setMonth(adjustedStartDate.getMonth() + i);
    const monthName = monthNames[date.getMonth()];
    dynamicMonths.push(monthName);
  }

  const monthlyData = Array(rangeMonths).fill(0);

  data.forEach((item) => {
    const date = new Date(item.date);
    if (date >= adjustedStartDate) {
      const diffInMonths =
        date.getMonth() -
        adjustedStartDate.getMonth() +
        12 * (date.getFullYear() - adjustedStartDate.getFullYear());
      if (diffInMonths >= 0 && diffInMonths < rangeMonths) {
        monthlyData[diffInMonths] += item.amount;
      }
    }
  });

  return { months: dynamicMonths, totals: monthlyData };
};

function IncomeExpense({ yearDropDown }) {
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState([]);
  const [income, setIncome] = useState([]);

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const expenseResponse = await fetch(
          `${API_BASE_URL}/getallexpense`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const incomeResponse = await fetch(
          `${API_BASE_URL}/getallIncomes`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const expenseData = await expenseResponse.json();
        const incomeData = await incomeResponse.json();

        const FilteredExpense = expenseData.expenses.filter(
          (expense) =>
            expense.header === "Direct Expense" ||
            expense.header === "Other Expense" ||
            expense.header === "Cost of Goods Sold (COGS)" ||
            expense.header === "Operating Expenses"
        );

        const FilteredIncome = incomeData.incomes.filter(
          (income) =>
            income.header === "Revenue" ||
            income.header === "Sales" ||
            income.header === "Other Income"
        );

        console.log("FilteredExpense", FilteredExpense);
        console.log("FilteredIncome", FilteredIncome);

        const expenses = Array.isArray(FilteredExpense) ? FilteredExpense : [];
        const incomes = Array.isArray(FilteredIncome) ? FilteredIncome : [];

        console.log("expenses", expenses);
        console.log("incomes", incomes);

        const filteredExpense = filterDataByDropdown(expenses, yearDropDown);
        const filteredIncome = filterDataByDropdown(incomes, yearDropDown);

        setExpense(filteredExpense);
        setIncome(filteredIncome);
      } catch (error) {
        console.error("Error fetching data:", error);
        setExpense([]);
        setIncome([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, yearDropDown]);

  const rangeMonths =
    yearDropDown === "Last 12 Months"
      ? 12
      : yearDropDown === "Last 6 Months"
      ? 6
      : 12;

  const groupedExpense = groupDataByMonth(expense, rangeMonths, yearDropDown);
  const groupedIncome = groupDataByMonth(income, rangeMonths, yearDropDown);

  const netCashFlow = groupedIncome.totals.map(
    (income, index) => income - groupedExpense.totals[index]
  );

  return (
    <div>
      {loading ? (
        <div className="flex flex-col space-y-6 mt-16 items-center">
          <div className="flex space-x-4 items-end">
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-44 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-48 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-28 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-40 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-48 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-24 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-28 w-8 rounded"></div>
            </div>
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <div className="bg-gray-300 h-48 w-8 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <BarChart
            margin={{ top: 27, left: 60, right: 10, bottom: 45 }}
            height={280}
            series={[
              {
                data: groupedIncome.totals,
                label: "Income",
                color: "#016FC4",
                stack: "stack1",
              },
              {
                data: groupedExpense.totals,
                label: "Expense",
                color: "#3AC0DA",
                stack: "stack1",
              },
            ]}
            xAxis={[{ data: groupedIncome.months, scaleType: "band" }]}
            yAxis={[
              {
                valueFormatter: (value) => {
                  if (value >= 1000000 || value <= -1000000) {
                    return `${(value / 1000000).toFixed(0)}M`;
                  } else if (value >= 1000 || value <= -1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                },
              },
            ]}
            slotProps={{
              legend: {
                direction: "row",
                position: { vertical: "bottom", horizontal: "middle" },
                padding: -6,
                itemMarkWidth: 27,
                itemMarkHeight: 10,
              },
            }}
          />
          <div className="flex flex-col">
            <div className="border-t border-gray-300 my-4"></div>
            <div className="flex justify-evenly items-center w-full">
              <div className="flex flex-col items-center text-center">
                <p className="font-semibold text-gray-700">Total Income</p>
                <p className="text-gray-700 text-lg font-bold">
                  Nu.{" "}
                  {groupedIncome.totals
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="border-l border-gray-300 h-12"></div>
              <div className="flex flex-col items-center text-center">
                <p className="font-semibold text-gray-700">Total Expense</p>
                <p className="text-gray-700 text-lg font-bold">
                  Nu.{" "}
                  {groupedExpense.totals
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="border-l border-gray-300 h-12"></div>
              <div className="flex flex-col items-center text-center">
                <p className="font-semibold text-gray-700">Net Income</p>
                <p className="text-gray-700 text-lg font-bold">
                  Nu. {netCashFlow.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(IncomeExpense);
