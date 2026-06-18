import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const predefinedRanges = [
  { label: "This Month", value: "This Month" },
  { label: "Last Month", value: "Last Month" },
  { label: "Last Quarter", value: "Last Quarter" },
  { label: "This Year", value: "This Year" },
  { label: "Last Year", value: "Last Year" },
  { label: "Custom", value: "Custom" },
];

const calculateDateRange = (range) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  switch (range) {
    case "This Month":
      return {
        startDate: new Date(currentYear, currentMonth, 1),
        endDate: new Date(currentYear, currentMonth + 1, 0),
      };
    case "Last Month":
      return {
        startDate: new Date(currentYear, currentMonth - 1, 1),
        endDate: new Date(currentYear, currentMonth, 0),
      };
    case "Last Quarter":
      const quarterStartMonth = currentMonth - 3;
      const quarterEndMonth = currentMonth - 1;
      return {
        startDate: new Date(
          quarterStartMonth < 0 ? currentYear - 1 : currentYear,
          (quarterStartMonth + 12) % 12,
          1
        ),
        endDate: new Date(
          quarterEndMonth < 0 ? currentYear - 1 : currentYear,
          (quarterEndMonth + 12) % 12 + 1,
          0
        ),
      };
    case "This Year":
      return {
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31),
      };
    case "Last Year":
      return {
        startDate: new Date(currentYear - 1, 0, 1),
        endDate: new Date(currentYear - 1, 11, 31),
      };
    default:
      return { startDate: null, endDate: null };
  }
};

const DateRange = ({ onFilteredDataChange, setLoading, loading }) => {
  const [dateRange, setDateRange] = useState("This Month");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [error, setError] = useState("");

  const handleUpdate = () => {
    let { startDate, endDate } = calculateDateRange(dateRange);

    if (dateRange === "Custom") {
      if (!customStartDate || !customEndDate) {
        setError("Please select a valid custom date range.");
        return;
      }
      if (customStartDate > customEndDate) {
        setError("Start date cannot be later than the end date.");
        return;
      }
      startDate = customStartDate;
      endDate = customEndDate;
    }

    setError("");
    setLoading(true); // Trigger loading in parent

    // Simulate data filtering
    setTimeout(() => {
      setLoading(false); // Stop loading in parent
      onFilteredDataChange({ startDate, endDate });
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg shadow">
      <div className={`flex items-center justify-between gap-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-4 flex-grow">
          <label htmlFor="dateRange" className="font-semibold text-lg">
            Select Date Range:
          </label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-md text-lg w-60"
          >
            {predefinedRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        <button
  onClick={handleUpdate}
  className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition"
  disabled={
    (dateRange === "Custom" && (!customStartDate || !customEndDate)) || loading
  }
>
  Update
</button>

      </div>

      {dateRange === "Custom" && (
        <div className="flex items-center gap-4 mt-4">
          <label className="font-semibold">Custom Range:</label>
          <DatePicker
            selected={customStartDate}
            onChange={(date) => setCustomStartDate(date)}
            placeholderText="Start Date"
            className="border px-4 py-2 rounded-md text-lg"
          />
          <DatePicker
            selected={customEndDate}
            onChange={(date) => setCustomEndDate(date)}
            placeholderText="End Date"
            className="border px-4 py-2 rounded-md text-lg"
          />
        </div>
      )}

      {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
    </div>
  );
};

export default DateRange;
