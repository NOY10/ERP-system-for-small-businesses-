import { Button, Menu, MenuItem } from "@mui/material";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAuthStore from "../store/useAuthStore";

const RecievableSummary = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  visibleRows,
  headCells,
}) => {
  const [dateRange, setDateRange] = useState("This Month");
  const [anchorEl, setAnchorEl] = useState(null);
  const [recievableData, setRecievableData] = useState({
    totalOutstanding: 0,
    dueToday: 0,
    dueWithin30Days: 0,
  });
  const [loading, setLoading] = useState(true); // Loading state
  const { token } = useAuthStore();
  // Fetch payable summary from backend
  useEffect(() => {
    const fetchRecievableData = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch("http://localhost:8000/incomeSummary", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRecievableData({
          totalOutstanding: data.totalOutstanding || 0,
          dueToday: data.dueToday || 0,
          dueWithin30Days: data.dueWithin30Days || 0,
        });
      } catch (error) {
        console.error("Error fetching recievable summary:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchRecievableData();
  }, [token]);

  useEffect(() => {
    const now = new Date();

    if (dateRange === "This Month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      if (startDate?.toISOString() !== firstDay.toISOString())
        setStartDate(firstDay);
      if (endDate?.toISOString() !== lastDay.toISOString()) setEndDate(lastDay);
    } else if (dateRange === "This Week") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      if (startDate?.toISOString() !== monday.toISOString())
        setStartDate(monday);
      if (endDate?.toISOString() !== sunday.toISOString()) setEndDate(sunday);
    } else if (dateRange === "Custom") {
      if (!startDate) setStartDate(new Date());
      if (!endDate) setEndDate(new Date());
    }
  }, [dateRange, setStartDate, setEndDate, startDate, endDate]);

  const handleDateRangeChange = (e) => {
    const selectedRange = e.target.value;
    setDateRange(selectedRange);

    if (selectedRange !== "Custom") {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportAsCSV = () => {
    const headers = headCells.map((cell) => cell.label).join(",");
    const rows = visibleRows.map((row) =>
      headCells.map((cell) => row[cell.id] || "").join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "expenses.csv");
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Expense Report", 14, 10);

    const tableHeaders = headCells.map((cell) => cell.label);
    const tableRows = visibleRows.map((row) =>
      headCells.map((cell) => row[cell.id] || "")
    );

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 20,
    });

    doc.save("expenses.pdf");
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-blue-100 rounded-lg p-4 mb-4 shadow-md space-y-4 md:space-y-0">
      {/* Total Outstanding Payables */}
      <div className="flex items-center w-full md:w-auto">
        <div className="bg-green-200 text-green-600 rounded-full p-2 mr-4">
          <svg
            className="h-10 w-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Outstanding Recievable</p>
          {loading ? (
            <p className="text-lg font-semibold animate-pulse bg-gray-200 rounded-md w-24 h-6"></p>
          ) : (
            <p className="text-lg font-semibold">
              Nu. {recievableData.totalOutstanding.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Due Today */}
      <div className="text-center md:text-left w-1/2 md:w-auto">
        <p className="text-sm text-gray-500">Due Today</p>
        {loading ? (
          <p className="text-base font-semibold animate-pulse bg-gray-200 rounded-md w-16 h-5 mx-auto md:mx-0"></p>
        ) : (
          <p className="text-base font-semibold text-green-500">
            Nu. {recievableData.dueToday.toLocaleString()}
          </p>
        )}
      </div>

      {/* Due Within 30 Days */}
      <div className="text-center md:text-left w-1/2 md:w-auto">
        <p className="text-sm text-gray-500">Due Within 30 Days</p>
        {loading ? (
          <p className="text-base font-semibold animate-pulse bg-gray-200 rounded-md w-20 h-5 mx-auto md:mx-0"></p>
        ) : (
          <p className="text-base font-semibold text-green-500">
            Nu. {recievableData.dueWithin30Days.toLocaleString()}
          </p>
        )}
      </div>

      {/* Date Range Selector */}
      <div className="w-full md:w-auto flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center">
        {dateRange === "Custom" ? (
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="text-sm border rounded-md px-2 py-1 w-full md:w-auto"
              placeholderText="Start Date"
              aria-label="Start Date"
            />
            <span className="animate-pulse text-gray-500">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              className="text-sm border rounded-md px-2 py-1 w-full md:w-auto"
              placeholderText="End Date"
              aria-label="End Date"
            />
          </div>
        ) : (
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="text-base border rounded-md px-3 py-2 shadow-sm bg-white w-full md:w-auto"
            aria-label="Select Date Range"
          >
            <option value="This Month">This Month</option>
            <option value="This Week">This Week</option>
            <option value="Custom">Custom</option>
          </select>
        )}
      </div>

      {/* Export Button */}

      <Button
        variant="contained"
        onClick={handleExportClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2 shadow transition w-full md:w-auto"
        style={{ textTransform: "none" }}
      >
        <svg
          className="h-5 w-5 text-white inline-block mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            exportAsCSV();
            handleClose();
          }}
        >
          Download as CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportAsPDF();
            handleClose();
          }}
        >
          Download as PDF
        </MenuItem>
      </Menu>
    </div>
  );
};

export default RecievableSummary;
