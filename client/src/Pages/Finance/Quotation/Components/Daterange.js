import { Button, Menu, MenuItem } from "@mui/material";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Daterange = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  visibleRows,
  headCells,
}) => {
  const [dateRange, setDateRange] = useState("This Month");
  const [anchorEl, setAnchorEl] = useState(null);

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
    saveAs(blob, "Invoice.csv");
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Invoice Report", 14, 10);

    const tableHeaders = headCells.map((cell) => cell.label);
    const tableRows = visibleRows.map((row) =>
      headCells.map((cell) => row[cell.id] || "")
    );
    console.log("visibleRows:", visibleRows);
    console.log("headCells:", headCells);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 20,
    });

    doc.save("Invoice.pdf");
  };

  return (
    <div className="flex items-center justify-between p-4 mb-1 bg-white shadow rounded-lg rounded-b-none">
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
            <span className="text-gray-500">to</span>
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
      <div className="w-full md:w-auto">
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

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
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
    </div>
  );
};

export default Daterange;
