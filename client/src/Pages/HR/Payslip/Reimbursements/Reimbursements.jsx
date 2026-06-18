import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import GetAppIcon from "@mui/icons-material/GetApp";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../Components/Toast";
import useAuthStore from "../../../../store/useAuthStore";

// Import jsPDF and its AutoTable plugin for PDF generation
import jsPDF from "jspdf";
import "jspdf-autotable";

import { API_BASE_URL } from "../../../../config/api";

const pastelColors = [
  "#f07167", "#335c67", "#7f5539", "#f28482", "#f5cac3",
  "#6b705c", "#cb997e", "#9d6b53", "#c9cba3", "#eae0d5",
  "#b392ac", "#735d78", "#e27396", "#f29559", "#acd8aa"
];

const getRandomColor = (() => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      colorMap.set(id, pastelColors[Math.floor(Math.random() * pastelColors.length)]);
    }
    return colorMap.get(id);
  };
})();

const getInitials = (name) =>
  name ? name.split(" ").map((n) => n[0]).join("") : "";

const actionOptions = [
  "Generate (Single)",
  "Bulk Updates"
];

const PayslipTable = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // Main States
  const [payslips, setPayslips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  // Initially, set the start date to one month ago and auto-calculate the end date.
  const initialStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0];
  const initialEndDate = new Date(new Date(initialStartDate).getFullYear(), new Date(initialStartDate).getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  const [dates, setDates] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate
  });
  const [selectedAction, setSelectedAction] = useState("Generate (Single)");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // For download menu (PDF & CSV)
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  // New state for Email Dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  // Holds the _id's of payslips selected for email
  const [selectedPayslipIds, setSelectedPayslipIds] = useState([]);

  // -----------------------------
  // Fetch Functions
  // -----------------------------
  const fetchPayslips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payslips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPayslips(data.payslips);
    } catch (error) {
      console.error("Error fetching payslips:", error);
    }
  };

  // Fetch payslips only for the selected period
  const fetchPayslipsForPeriod = async (start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payslips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const periodPayslips = data.payslips.filter((p) => {
        const pStart = new Date(p.startDate).toISOString().split("T")[0];
        const pEnd = new Date(p.endDate).toISOString().split("T")[0];
        return pStart === start && pEnd === end;
      });
      setPayslips(periodPayslips);
    } catch (error) {
      console.error("Error fetching period payslips:", error);
    }
  };

  // Fetch employees (for single payslip generation)
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getallEmployees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const formattedEmployees = data.employees.map(emp => ({
          id: emp._id,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          role: emp.role,
          dob: emp.dob,
          cid: emp.cid,
          department: emp.department,
          salary: emp.salary,
        }));
        setEmployees(formattedEmployees);
      }
     
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, [token]);

  // -----------------------------
  // Date Change Handler
  // -----------------------------
  const handleStartDateChange = (e) => {
    const selectedStartDate = e.target.value;
    const date = new Date(selectedStartDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];
    setDates({ startDate: selectedStartDate, endDate: lastDay });
  };

  // -----------------------------
  // Generate Payslip Handler
  // -----------------------------
  const handleGenerate = async () => {
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    // Ensure the range is within the same month
    if (start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) {
      setToastMessage("Please select a date range within the same month.");
      setShowToast(true);
      return;
    }

    // Check if payslips already exist for this period
    try {
      const response = await fetch(`${API_BASE_URL}/payslips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const periodPayslips = data.payslips.filter((p) => {
        const pStart = new Date(p.startDate).toISOString().split("T")[0];
        const pEnd = new Date(p.endDate).toISOString().split("T")[0];
        return pStart === dates.startDate && pEnd === dates.endDate;
      });
      if (periodPayslips.length > 0) {
        setPayslips(periodPayslips);
        setToastMessage("Payslips for this period already exist.");
        setShowToast(true);
        setOpenDialog(false);
        return;
      }
    } catch (error) {
      console.error("Error checking existing payslips:", error);
    }

    // If not, generate the payslips
    setIsLoading(true);
    try {
      let url, body;
      if (selectedAction === "Generate (Single)") {
        if (!selectedEmployee) {
          setToastMessage("Please select an employee for single generation.");
          setShowToast(true);
          setIsLoading(false);
          return;
        }
        url = `${API_BASE_URL}/generatePayslip`;
        body = { ...dates, employeeId: selectedEmployee, bankDetails: {} };
      } else if (selectedAction === "Bulk Updates") {
        url = `${API_BASE_URL}/generate-all-payslips`;
        body = dates;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        await fetchPayslipsForPeriod(dates.startDate, dates.endDate);
        setOpenDialog(false);
        const data = await response.json();
        setToastMessage(data.message || "Payslips generated successfully");
        setShowToast(true);
      } else {
        const errData = await response.json();
        setToastMessage(errData.error || "Generation failed");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error generating payslips:", error);
    }
    setIsLoading(false);
  };

  // -----------------------------
  // PDF Generation Function
  // -----------------------------
  // Generates a nicely formatted PDF for a given payslip.
  const generatePDFForPayslip = (payslip) => {
    const doc = new jsPDF("p", "pt", "a4");

    // Header Section
    doc.setFillColor(60, 60, 60);
    doc.rect(0, 0, 595, 60, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Drukbooks Payslip", 40, 40);

    // Employee Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 80;
    doc.text("Employee Details:", 40, y);
    y += 15;
    doc.text(`Name: ${payslip.name || "N/A"}`, 40, y);
    y += 15;
    doc.text(
      `Employee ID: ${
        payslip.employeeId && typeof payslip.employeeId === "object"
          ? payslip.employeeId.employeeId
          : "N/A"
      }`,
      40,
      y
    );
    y += 15;
    doc.text(
      `Department: ${
        payslip.employeeId && typeof payslip.employeeId === "object"
          ? payslip.employeeId.department
          : "N/A"
      }`,
      40,
      y
    );
    y += 15;
    doc.text(`Bank/Cheque: ${payslip.bankDetails?.account || "N/A"}`, 40, y);
    y += 15;
    doc.text(
      `Duration: ${new Date(payslip.startDate).toLocaleDateString()} - ${new Date(
        payslip.endDate
      ).toLocaleDateString()}`,
      40,
      y
    );

    // Salary Summary Table
    const basicSalary = Number(payslip.basicSalary) || 0;
    const allowancesTotal = (payslip.allowances || []).reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0
    );
    const totalDeductions = (payslip.deductions || []).reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );
    const netPay = basicSalary + allowancesTotal - totalDeductions;

    y += 25;
    doc.text("Salary Summary:", 40, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [["Basic Salary", "Total Allowances", "Total Deductions", "Net Pay"]],
      body: [[basicSalary, allowancesTotal, totalDeductions, netPay]],
      theme: "grid",
      styles: { halign: "center" },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 },
    });

    // Allowances Table
    y = doc.lastAutoTable.finalY + 20;
    doc.text("Allowances:", 40, y);
    y += 10;
    if (payslip.allowances && payslip.allowances.length > 0) {
      doc.autoTable({
        startY: y,
        head: [["Name", "Amount"]],
        body: payslip.allowances.map((item) => [item.name, item.amount]),
        theme: "striped",
        styles: { halign: "center" },
        headStyles: { fillColor: [100, 100, 100], textColor: 255 },
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // Deductions Table
    doc.text("Deductions:", 40, y);
    y += 10;
    if (payslip.deductions && payslip.deductions.length > 0) {
      doc.autoTable({
        startY: y,
        head: [["Name", "Amount"]],
        body: payslip.deductions.map((item) => [item.name, item.amount]),
        theme: "striped",
        styles: { halign: "center" },
        headStyles: { fillColor: [100, 100, 100], textColor: 255 },
      });
      y = doc.lastAutoTable.finalY + 20;
    }

    // Footer
    doc.setFontSize(10);
    doc.text("Generated by Drukbooks", 40, 800);

    return doc;
  };

  // -----------------------------
  // Email Dialog Handlers
  // -----------------------------
  // Open the email dialog and pre-select all filtered payslip IDs.
  const handleOpenEmailDialog = () => {
    const allIds = filteredPayslips.map((p) => p._id);
    setSelectedPayslipIds(allIds);
    setEmailDialogOpen(true);
  };

  // Toggle selection for a given payslip ID.
  const togglePayslipSelection = (id) => {
    setSelectedPayslipIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Send emails for selected payslips.
  const handleSendEmails = async () => {
    if (selectedPayslipIds.length === 0) {
      setToastMessage("Please select at least one email to send.");
      setShowToast(true);
      return;
    }
    setIsLoading(true);
    try {
      for (let id of selectedPayslipIds) {
        const payslip = payslips.find((p) => p._id === id);
        if (!payslip) continue;
        // Skip payslips without an email address
        if (!payslip.email) {
          console.warn("No email found for payslip ID:", id);
          continue;
        }
        const pdfDoc = generatePDFForPayslip(payslip);
        // Get the PDF as a Data URI string
        const pdfDataURI = pdfDoc.output("datauristring");
        // Send email to backend endpoint
        const response = await fetch(
          `${API_BASE_URL}/send-payslip-email/${payslip._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ email: payslip.email, pdf: pdfDataURI })
          }
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to send email");
        }
      }
      setToastMessage("Emails sent successfully.");
      setShowToast(true);
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      setToastMessage("Error sending emails: " + error.message);
      setShowToast(true);
    }
    setIsLoading(false);
  };

  // -----------------------------
  // Download Functions (PDF & CSV)
  // -----------------------------
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Employee", "Start Date", "End Date", "Gross Salary", "Deductions", "Net Pay", "Status"];
    const tableRows = [];

    payslips.forEach(payslip => {
      const basicSalary = Number(payslip.basicSalary) || 0;
      const allowances = Array.isArray(payslip.allowances) ? payslip.allowances : [];
      const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
      const grossSalary = basicSalary + totalAllowances;
      const deductions = Array.isArray(payslip.deductions) ? payslip.deductions : [];
      const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const netSalary = grossSalary - totalDeductions;
      const rowData = [
        payslip.name,
        new Date(payslip.startDate).toLocaleDateString(),
        new Date(payslip.endDate).toLocaleDateString(),
        grossSalary,
        totalDeductions,
        netSalary,
        payslip.status
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("payslips.pdf");
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Employee", "Start Date", "End Date", "Gross Salary", "Deductions", "Net Pay", "Status"];
    csvContent += headers.join(",") + "\r\n";

    payslips.forEach(payslip => {
      const basicSalary = Number(payslip.basicSalary) || 0;
      const allowances = Array.isArray(payslip.allowances) ? payslip.allowances : [];
      const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
      const grossSalary = basicSalary + totalAllowances;
      const deductions = Array.isArray(payslip.deductions) ? payslip.deductions : [];
      const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const netSalary = grossSalary - totalDeductions;
      const row = [
        payslip.name,
        new Date(payslip.startDate).toLocaleDateString(),
        new Date(payslip.endDate).toLocaleDateString(),
        grossSalary,
        totalDeductions,
        netSalary,
        payslip.status
      ];
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payslips.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------
  // Update Status and Delete Handlers
  // -----------------------------
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setPayslips(
          payslips.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
        setToastMessage("Status updated successfully");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payslip?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/deletePayslip/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          setPayslips(payslips.filter((p) => p._id !== id));
          setToastMessage("Payslip deleted successfully");
          setShowToast(true);
        } else {
          console.error("Failed to delete payslip");
        }
      } catch (error) {
        console.error("Error deleting payslip:", error);
      }
    }
  };

  // -----------------------------
  // DataGrid Columns Definition
  // -----------------------------
  const columns = [
    {
      field: "name",
      headerName: "Employee",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: getRandomColor(params?.row?.employeeId?.id || params?.row?.id) }}>
            {getInitials(params?.row?.name || "")}
          </Avatar>
          <span>{params?.row?.name || ""}</span>
        </div>
      )
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      renderCell: (params) =>
        params?.row?.startDate ? new Date(params.row.startDate).toLocaleDateString() : ""
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      renderCell: (params) =>
        params?.row?.endDate ? new Date(params.row.endDate).toLocaleDateString() : ""
    },
    {
      field: "grossSalary",
      headerName: "Gross Salary",
      width: 150,
      renderCell: (params) => {
        if (params?.row?.basicSalary == null) return "";
        const basicSalary = Number(params.row.basicSalary) || 0;
        const allowances = Array.isArray(params.row.allowances) ? params.row.allowances : [];
        const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        return basicSalary + totalAllowances;
      }
    },
    {
      field: "deductions",
      headerName: "Deductions",
      width: 150,
      renderCell: (params) => {
        if (!params?.row?.deductions) return "";
        const deductions = Array.isArray(params.row.deductions) ? params.row.deductions : [];
        return deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      }
    },
    {
      field: "netSalary",
      headerName: "Net Pay",
      width: 150,
      renderCell: (params) => {
        if (params?.row?.basicSalary == null) return "";
        const basicSalary = Number(params.row.basicSalary) || 0;
        const allowances = Array.isArray(params.row.allowances) ? params.row.allowances : [];
        const totalAllowances = allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        const deductions = Array.isArray(params.row.deductions) ? params.row.deductions : [];
        const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        return basicSalary + totalAllowances - totalDeductions;
      }
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Select
          value={params?.row?.status || ""}
          onChange={(e) => handleStatusChange(params?.row?._id, e.target.value)}
          sx={{ height: 35, width: 120 }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
          <MenuItem value="Paid">Paid</MenuItem>
          <MenuItem value="Review">Review</MenuItem>
        </Select>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/payslip/${params?.row?._id}`);
            }}
          >
            <FaEdit className="text-blue-500 hover:text-blue-700 text-xl" />
          </button>
          <button onClick={() => handleDelete(params?.row?._id)}>
            <FaTrashAlt className="text-red-500 hover:text-red-700 text-xl" />
          </button>
        </div>
      )
    }
  ];

  // -----------------------------
  // Filtered Payslips for DataGrid
  // -----------------------------
  const filteredPayslips = payslips.filter((payslip) =>
    (payslip.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 bg-white">
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          label="Search Employees"
          variant="outlined"
          size="small"
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <div className="flex gap-2 items-center">
          {/* Clicking this button opens the email dialog */}
          <Button
            variant="outlined"
            onClick={handleOpenEmailDialog}
            sx={{ minWidth: 40, padding: "6px" }}
          >
            <EmailIcon />
          </Button>
          <Button
            variant="outlined"
            onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
            sx={{ minWidth: 40, padding: "6px" }}
          >
            <GetAppIcon />
          </Button>
          {/* Download Menu */}
          <Menu
            anchorEl={downloadMenuAnchor}
            open={Boolean(downloadMenuAnchor)}
            onClose={() => setDownloadMenuAnchor(null)}
          >
            <MenuItem onClick={() => { downloadPDF(); setDownloadMenuAnchor(null); }}>
              Download PDF
            </MenuItem>
            <MenuItem onClick={() => { downloadCSV(); setDownloadMenuAnchor(null); }}>
              Download CSV
            </MenuItem>
          </Menu>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Actions</InputLabel>
            <Select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              label="Actions"
            >
              {actionOptions.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </div>
      </Box>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <CircularProgress size={50} sx={{ color: "rgba(74, 144, 226, 1)" }} />
        </div>
      ) : (
        <Paper sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredPayslips.filter((row) => row != null)}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row._id || row.id}
            onRowClick={(params) => navigate(`/payslip/${params.row._id || params.row.id}`)}
            sx={{
              "& .MuiDataGrid-cell": { borderBottom: "1px solid #f0f0f0" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f5f5f5" }
            }}
          />
        </Paper>
      )}

      {/* Dialog for Date Range / Generation */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Set Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, minHeight: 200 }}>
            <TextField
              label="Start Date"
              type="date"
              value={dates.startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
            />
            {/* End date is auto-calculated and disabled */}
            <TextField
              label="End Date"
              type="date"
              value={dates.endDate}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            {selectedAction === "Generate (Single)" && (
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Employee"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerate} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog: Lists email IDs (instead of names) */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Send Payslips via Email</DialogTitle>
        <DialogContent>
          <List>
            {filteredPayslips.map((payslip) => (
              <ListItem
                key={payslip._id}
                button
                onClick={() => togglePayslipSelection(payslip._id)}
              >
                <Checkbox checked={selectedPayslipIds.includes(payslip._id)} />
                {/* Display the email ID as the primary text */}
                <ListItemText primary={payslip.email || "No Email"} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmails} variant="contained">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        severity="success"
      />
    </div>
  );
};

export default PayslipTable;
