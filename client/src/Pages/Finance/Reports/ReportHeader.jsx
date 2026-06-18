import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportHeader = ({ onDateChange, onCompareChange, onCustomDateChange }) => {
  const [dateRange, setDateRange] = useState("End of This Month");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [compareWith, setCompareWith] = useState("1 Year");

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    onDateChange(value);
    if (value !== "Custom") {
      onCustomDateChange(null, null);
    }
  };

  const handleCompareChange = (e) => {
    const value = e.target.value;
    setCompareWith(value);
    onCompareChange(value);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <label htmlFor="dateRange" className="text-lg font-semibold text-gray-700">
          Date Range:
        </label>
        <select
          id="dateRange"
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 hover:bg-white transition"
        >
          <option value="End of This Month">This Month</option>
          <option value="This Quarter">This Quarter</option>
          <option value="This Year">This Year</option>
          <option value="Last Year">Last Year</option>
          <option value="Last Quarter">Last Quarter</option>
          <option value="Last Month">Last Month</option>
          <option value="Custom">Custom</option>
        </select>
        {dateRange === "Custom" && (
          <div className="flex items-center gap-2">
            <DatePicker
              selected={customStartDate}
              onChange={(date) => {
                setCustomStartDate(date);
                onCustomDateChange(date, customEndDate);
              }}
              placeholderText="Start Date"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => {
                setCustomEndDate(date);
                onCustomDateChange(customStartDate, date);
              }}
              placeholderText="End Date"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <label htmlFor="compareWith" className="text-lg font-semibold text-gray-700">
          Compare With:
        </label>
        <select
          id="compareWith"
          value={compareWith}
          onChange={handleCompareChange}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:ring-2 focus:ring-blue-300 hover:bg-white transition"
        >
          <option value="1 Year">1 Period</option>
          <option value="2 Years">2 Periods</option>
          <option value="3 Years">3 Periods</option>
          <option value="4 Years">4 Periods</option>
        </select>
      </div>
    </div>
  );
};

export default ReportHeader;
