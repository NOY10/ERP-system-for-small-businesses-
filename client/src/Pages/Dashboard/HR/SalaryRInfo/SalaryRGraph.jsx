import React, { memo, useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts";

function SalaryRGraph({ yearDropDown }) {
  const [loading, setLoading] = useState(true);
  const [monthlySalary, setMonthlySalary] = useState({
    monthlySalary: [],
    months: [],
  });

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JS Date
  };

  const filterDataByDropdown = (data, dropdown) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const lastYear = currentYear - 1;

    const startOfThisFiscalYear = new Date(currentYear, 0, 1);
    const startOfLastFiscalYear = new Date(lastYear, 0, 1);
    const startOf12MonthsAgo = new Date();
    startOf12MonthsAgo.setMonth(currentDate.getMonth() - 12);
    const startOf6MonthsAgo = new Date();
    startOf6MonthsAgo.setMonth(currentDate.getMonth() - 6);

    switch (dropdown) {
      case "This Fiscal Year":
        return data.filter(
          (item) => parseDate(item.date) >= startOfThisFiscalYear
        );

      case "Previous Fiscal Year":
        return data.filter(
          (item) =>
            parseDate(item.date) >= startOfLastFiscalYear &&
            parseDate(item.date) < startOfThisFiscalYear
        );

      case "Last 12 Months":
        return data.filter(
          (item) => parseDate(item.date) >= startOf12MonthsAgo
        );

      case "Last 6 Months":
        return data.filter((item) => parseDate(item.date) >= startOf6MonthsAgo);

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
    const currentDate = new Date();
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
      const date = parseDate(item.date);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/SalaryData.json");
        const data = await response.json();
        const monthlySalary = filterDataByDropdown(
          data.salaryReport,
          yearDropDown
        );

        setMonthlySalary({ monthlySalary, months: data.months });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [yearDropDown]);

  const rangeMonths =
    yearDropDown === "Last 12 Months"
      ? 12
      : yearDropDown === "Last 6 Months"
      ? 6
      : 12;

  const groupedInflows = groupDataByMonth(
    monthlySalary.monthlySalary,
    rangeMonths,
    yearDropDown
  );

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center mt-8">
          {/* Skeleton loading state */}
          <div className="relative w-full h-60 bg-gray-50">
            {/* Line points loading */}
            <div className="animate-pulse absolute w-full h-full">
              {/* Points placeholder */}
              <div className="flex justify-evenly h-full px-2">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    {/* Placeholder point */}
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    {/* Placeholder vertical bar */}
                    <div
                      className={`bg-gray-300 rounded-full w-1 ${
                        idx % 2 === 0 ? "h-10" : "h-16"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <LineChart
            margin={{ top: 27, left: 60, right: 10, bottom: 45 }}
            xAxis={[
              {
                data: groupedInflows.months,
                scaleType: "band",
                categoryGapRatio: 0.3,
              },
            ]}
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
            series={[
              {
                curve: "natural",
                data: groupedInflows.totals,
                label: "Salary Release",
                color: "#016FC4",
              },
            ]}
            height={280}
            slotProps={{ legend: { hidden: true } }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(SalaryRGraph);
