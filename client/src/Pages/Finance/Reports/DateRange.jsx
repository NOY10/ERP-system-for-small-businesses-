import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRange = ({ datas, onFilteredDataChange }) => {
  const [dateRange, setDateRange] = useState("This Month");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [compareWith, setCompareWith] = useState(1);
  const [customPeriod, setCustomPeriod] = useState("");

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getRangeDates = (range, offset = 0) => {
    let adjustedYear = currentYear + offset;
    let adjustedMonth = currentMonth + offset;

    switch (range) {
      case "This Month":
        return [
          new Date(currentYear, adjustedMonth, 1),
          new Date(currentYear, adjustedMonth + 1, 0),
        ];
      case "Last Month":
        return [
          new Date(currentYear, adjustedMonth - 1, 1),
          new Date(currentYear, adjustedMonth, 0),
        ];
      case "Last Quarter":
        const quarterStartMonth = adjustedMonth - 2;
        const quarterEndMonth = adjustedMonth;
        const startMonth =
          quarterStartMonth < 0
            ? (quarterStartMonth + 12) % 12
            : quarterStartMonth;
        const startYear = quarterStartMonth < 0 ? currentYear - 1 : currentYear;
        return [
          new Date(startYear, startMonth, 1),
          new Date(currentYear, quarterEndMonth + 1, 0),
        ];
      case "This Year":
        return [new Date(adjustedYear, 0, 1), new Date(adjustedYear, 11, 31)];
      case "Last Year":
        return [
          new Date(adjustedYear - 1, 0, 1),
          new Date(adjustedYear - 1, 11, 31),
        ];
      case "Custom":
        if (customEndDate) {
          const endDateWithTime = new Date(customEndDate);
          endDateWithTime.setHours(23, 59, 59, 999);
          return [customStartDate, endDateWithTime];
        }
        return [customStartDate, customEndDate];
      default:
        return [];
    }
  };

  // Filter data based on the selected range
  const filterData = (attempts = 0) => {
    if (
      dateRange === "Custom" &&
      (!customStartDate || !customEndDate || customStartDate > customEndDate)
    ) {
      alert("Please select a valid custom date range.");
      return;
    }

    const primaryRange = getRangeDates(dateRange);
    let primaryData = datas.filter(
      (item) =>
        new Date(item.date) >= primaryRange[0] &&
        new Date(item.date) <= primaryRange[1]
    );

    // If primaryData is empty, fetch data from the previous range
    if (primaryData.length === 0 && attempts < 5) {
      // Limit the number of attempts
      const previousRange = getRangeDates(dateRange, -1);
      primaryData = datas.filter(
        (item) =>
          new Date(item.date) >= previousRange[0] &&
          new Date(item.date) <= previousRange[1]
      );

      // Update the primaryRange to the previous range
      primaryRange[0] = previousRange[0];
      primaryRange[1] = previousRange[1];

      // Recursively call filterData with incremented attempts
      filterData(attempts + 1);
      return;
    }

    const comparisonData = [];
    for (let i = 0; i < compareWith; i++) {
      const offset = dateRange === "Last Quarter" ? -3 * i : -i;
      const offsetRange = getRangeDates(dateRange, offset);

      const comparisonPeriodData = datas.filter(
        (item) =>
          new Date(item.date) >= offsetRange[0] &&
          new Date(item.date) <= offsetRange[1]
      );

      comparisonData.push({
        period: [offsetRange[0], offsetRange[1]],
        data: comparisonPeriodData,
      });
    }

    onFilteredDataChange({
      comparisonData,
    });
  };

  // Trigger default filtering on mount
  useEffect(() => {
    filterData();
  }, [datas]);

  useEffect(() => {
    if (compareWith > 1 && dateRange === "Custom") {
      setDateRange("This Month");
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  }, [compareWith, dateRange]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 items-center mb-2 justify-between">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label htmlFor="dateRange" className="text-lg font-semibold">
          Date Range:
        </label>
        <select
          id="dateRange"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="Last Quarter">Last Quarter</option>
          <option value="This Year">This Year</option>
          <option value="Last Year">Last Year</option>
          {compareWith === 1 && <option value="Custom">Custom</option>}
        </select>
        {dateRange === "Custom" && compareWith === 1 && (
          <div className="flex gap-4">
            <DatePicker
              selected={customStartDate}
              onChange={setCustomStartDate}
              placeholderText="Start Date"
              className="border rounded-md px-4 py-2"
            />
            <DatePicker
              selected={customEndDate}
              onChange={setCustomEndDate}
              placeholderText="End Date"
              className="border rounded-md px-4 py-2"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label htmlFor="compareWith" className="text-lg font-semibold">
          Compare With:
        </label>
        <select
          id="compareWith"
          value={compareWith}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              setCompareWith("custom");
            } else {
              setCompareWith(parseInt(value, 10));
              setCustomPeriod("");
            }
          }}
          className="px-4 py-2 border rounded-md"
        >
          <option value={1}>1 Period</option>
          <option value={2}>2 Periods</option>
          <option value={3}>3 Periods</option>
          <option value={4}>4 Periods</option>
          <option value="custom">Custom Periods</option>
        </select>
        {(compareWith === "custom" || customPeriod !== "") && (
          <input
            type="number"
            value={customPeriod}
            onChange={(e) => {
              const period = Math.max(
                0,
                Math.min(12, parseInt(e.target.value, 10))
              );
              setCustomPeriod(period);
              setCompareWith(period);
            }}
            className="px-4 py-2 rounded-md w-40"
            placeholder="X should be <13"
            min="5"
            max="12"
          />
        )}
      </div>

      <button
        onClick={filterData}
        className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md ml-auto"
      >
        Update
      </button>
    </div>
  );
};

export default DateRange;
