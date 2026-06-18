import React, { useEffect, useState } from "react";
import useAuthStore from "../../../store/useAuthStore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Alert, Snackbar } from "@mui/material";


import { API_BASE_URL } from "../../../config/api";

const EmployeePayslips = () => {
  const { token, user } = useAuthStore();
  const employeeId = user?.id;
  const empId = user?.employeeId;
  const [payslips, setPayslips] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Set default date range to previous month
    const now = new Date();
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    setStartDate(firstDayOfPreviousMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfPreviousMonth.toISOString().split('T')[0]);
    
    fetchEmployeePayslips(
      firstDayOfPreviousMonth.toISOString().split('T')[0],
      lastDayOfPreviousMonth.toISOString().split('T')[0]
    );
  }, []);
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchEmployeePayslips = async (start, end) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employee-payslips/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Payslip fetched successfully!",
          severity: "success",
        });
        
        setAllPayslips(data.payslips);
        filterPayslipsByDate(data.payslips, start, end);
      } else {
        setError(data.error || "Failed to fetch payslips");
      }
    } catch (err) {
      setError("Server error");
    }
    setLoading(false);
  };

  const filterPayslipsByDate = (payslipList, start, end) => {
    const startD = new Date(start);
    const endD = new Date(end);
    const filtered = payslipList.filter((p) => {
      const payslipDate = new Date(p.startDate);
      return payslipDate >= startD && payslipDate <= endD;
    });
    setPayslips(filtered);
  };

  // Download function
  const handleDownload = (payslipData) => {
    const doc = new jsPDF("p", "pt", "a4");
    // Calculations
    const basicSalary = payslipData.basicSalary || 0;
    const allowancesTotal = payslipData.allowances?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
    const totalDeductions = payslipData.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const netPay = basicSalary + allowancesTotal - totalDeductions;
  
    // Header
    doc.setFillColor(112, 66, 100);
    doc.rect(0, 0, 595, 70, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Drukbooks Payslip", 40, 45);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 450, 45);
    doc.setDrawColor(200, 200, 200);
    doc.line(40, 70, 555, 70);
  
    // Employee Details
    doc.setFontSize(14);
    doc.setTextColor(34, 34, 34);
    doc.text("Employee Details", 40, 90);
    doc.setFontSize(12);
    let y = 110;
    const details = [
      `Name: ${payslipData.name || "N/A"}`,
      `Employee ID: ${payslipData.employeeId?.employeeId || "N/A"}`,
      `Department: ${payslipData.employeeId?.department || "N/A"}`,
      `Bank/Cheque: ${payslipData.bankDetails?.accountNumber || "N/A"}`,
      `Basic Salary: Nu. ${basicSalary}`,
      `Duration: ${new Date(payslipData.startDate).toLocaleDateString()} - ${new Date(payslipData.endDate).toLocaleDateString()}`
    ];
    details.forEach((line) => {
      doc.text(line, 40, y);
      y += 15;
    });
  
    // Salary Summary Table
    y += 10;
    doc.setFontSize(14);
    doc.text("Salary Summary", 40, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [["Basic Salary", "Total Allowances", "Total Deductions", "Net Pay"]],
      body: [[
        `Nu. ${basicSalary}`,
        `Nu. ${allowancesTotal}`,
        `Nu. ${totalDeductions}`,
        `Nu. ${netPay}`
      ]],
      theme: "grid",
      styles: { halign: "center", fontSize: 12 },
      headStyles: { fillColor: [112, 66, 100], textColor: 255 },
      margin: { left: 40, right: 40 },
    });
  
    // Allowances Table
    y = doc.lastAutoTable.finalY + 20;
    if (payslipData.allowances?.length > 0) {
      doc.setFontSize(14);
      doc.text("Allowances", 40, y);
      y += 10;
      doc.autoTable({
        startY: y,
        head: [["Name", "Amount"]],
        body: payslipData.allowances.map((item) => [item.name, `Nu. ${item.amount}`]),
        theme: "striped",
        styles: { halign: "center" },
        headStyles: { fillColor: [112, 66, 100], textColor: 255 },
        margin: { left: 40, right: 40 },
      });
    }
  
    // Deductions Table
    y = doc.lastAutoTable.finalY + 20;
    if (payslipData.deductions?.length > 0) {
      doc.setFontSize(14);
      doc.text("Deductions", 40, y);
      y += 10;
      doc.autoTable({
        startY: y,
        head: [["Name", "Amount"]],
        body: payslipData.deductions.map((item) => [item.name, `Nu. ${item.amount}`]),
        theme: "striped",
        styles: { halign: "center" },
        headStyles: { fillColor: [112, 66, 100], textColor: 255 },
        margin: { left: 40, right: 40 },
      });
    }
  
    // Save the PDF
    doc.save(`${payslipData.name || "payslip"}.pdf`);
  };

  const handleRefilter = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }
    filterPayslipsByDate(allPayslips, startDate, endDate);
  };

  return (
    <>
    <div className="p-8 border ">
      <h2 className="text-2xl font-bold mb-4">Payslips for Employee</h2>

      {/* Refilter section */}
      <form onSubmit={handleRefilter} className="mb-6 flex flex-col md:flex-row items-center gap-8 border p-4 rounded-lg shadow-md bg-gray-50">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded mt-2 md:mt-6"
        >
          Filter Payslips
        </button>
      </form>

      {loading ? (
        <p>Loading payslips...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : payslips.length === 0 ? (
        <p>No payslips available for the selected period.</p>
      ) : (
        <ul className="space-y-4">
          {payslips.map((payslip) => {
            const totalAllowances = payslip.allowances?.reduce((sum, a) => sum + (a.amount || 0), 0);
            const totalDeductions = payslip.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0);
            const grossPay = payslip.basicSalary + totalAllowances;
            const netPay = grossPay - totalDeductions;

            return (
              <li key={payslip._id} className="p-6 border rounded-xl shadow-md bg-white relative">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">
                    PaySlip for period :{" "}
                    {new Date(payslip.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(payslip.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>

                  <button
                    onClick={() => handleDownload(payslip)}
                    className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Download 
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Employee Info */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-2">Employee Details</h2>
                    <div className="text-sm text-gray-600">
                      <div className="flex">
                        <span className="w-32 font-medium">Employee ID</span>
                        <span>: {empId || "N/A"}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium">Name</span>
                        <span>: {payslip.name || "N/A"}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium">Period</span>
                        <span>
                          : {new Date(payslip.startDate).toLocaleDateString()} -{" "}
                          {new Date(payslip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-medium">Bank/Cheque</span>
                        <span>: {payslip.bankDetails?.accountNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Summary */}
                  <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-2">Salary Summary</h2>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Basic Salary</span>
                        <span>Nu. {payslip.basicSalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Allowances</span>
                        <span>Nu. {totalAllowances}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Deductions</span>
                        <span>Nu. {totalDeductions}</span>
                      </div>
                      <hr className="my-8" />
                      <div className="flex gap-4 mt-4">
                        <div className="flex-1 bg-green-100 border-l-4 rounded-2xl border-green-500 text-2xl font-bold p-3 text-center">
                          <p className="text-gray-900">Gross Pay: Nu. {grossPay}</p>
                        </div>
                        <div className="flex-1 bg-green-100 border-r-4 rounded-2xl border-green-500 text-2xl font-bold p-3 text-center">
                          <p className="text-gray-900">Net Pay: Nu. {netPay}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
    <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            color: "white",
            backgroundColor:
              snackbar.severity === "success" ? "#22c55e" : "#ef4444",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmployeePayslips;