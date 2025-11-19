import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import autoTable plugin
import React, { useEffect, useState } from "react";
import { SlidingCubeLoader } from "react-loaders-kit";
import { useParams } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";

const Payslip = () => {
  const { payslipId } = useParams();
  const { token } = useAuthStore();

  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", title: "", message: "" });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  // Fetch payslip details on mount
  const fetchPayslipDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/payslip/${payslipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const allowances = data.payslip.allowances || [];
        const deductions = data.payslip.deductions || [];
        setEmailInput(data.payslip.email);
        setPayslipData({
          ...data.payslip,
          allowances: allowances.map((item) => ({ ...item, isEditing: false })),
          deductions: deductions.map((item) => ({ ...item, isEditing: false })),
        });
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Error",
          message: data.error || "Failed to fetch payslip",
        });
      }
    } catch (error) {
      console.error("Error fetching payslip:", error);
      setToast({
        show: true,
        type: "error",
        title: "Error",
        message: "Error fetching payslip",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayslipDetails();
  }, [payslipId]);

  // --- Allowances Helpers ---
  const handleEditAllowance = (index) => {
    const newAllowances = [...payslipData.allowances];
    newAllowances[index].isEditing = true;
    setPayslipData({ ...payslipData, allowances: newAllowances });
  };

  const handleAllowanceChange = (index, field, value) => {
    const newAllowances = [...payslipData.allowances];
    newAllowances[index][field] = field === "amount" ? Number(value) : value;
    setPayslipData({ ...payslipData, allowances: newAllowances });
  };

  const handleSaveAllowance = (index) => {
    const newAllowances = [...payslipData.allowances];
    newAllowances[index].isEditing = false;
    setPayslipData({ ...payslipData, allowances: newAllowances });
  };

  const handleCancelAllowance = (index) => {
    const newAllowances = [...payslipData.allowances];
    if (!newAllowances[index]._id) {
      newAllowances.splice(index, 1);
    } else {
      newAllowances[index].isEditing = false;
    }
    setPayslipData({ ...payslipData, allowances: newAllowances });
  };

  const handleAddAllowance = () => {
    const newAllowance = { name: "", amount: 0, isEditing: true, new: true };
    setPayslipData({
      ...payslipData,
      allowances: [...payslipData.allowances, newAllowance],
    });
  };

  // --- Deductions Helpers ---
  const handleEditDeduction = (index) => {
    const newDeductions = [...payslipData.deductions];
    newDeductions[index].isEditing = true;
    setPayslipData({ ...payslipData, deductions: newDeductions });
  };

  const handleDeductionChange = (index, field, value) => {
    const newDeductions = [...payslipData.deductions];
    newDeductions[index][field] = field === "amount" ? Number(value) : value;
    setPayslipData({ ...payslipData, deductions: newDeductions });
  };

  const handleSaveDeduction = (index) => {
    const newDeductions = [...payslipData.deductions];
    newDeductions[index].isEditing = false;
    setPayslipData({ ...payslipData, deductions: newDeductions });
  };

  const handleCancelDeduction = (index) => {
    const newDeductions = [...payslipData.deductions];
    if (!newDeductions[index]._id) {
      newDeductions.splice(index, 1);
    } else {
      newDeductions[index].isEditing = false;
    }
    setPayslipData({ ...payslipData, deductions: newDeductions });
  };

  const handleAddDeduction = () => {
    const newDeduction = { name: "", amount: 0, isEditing: true, new: true };
    setPayslipData({
      ...payslipData,
      deductions: [...payslipData.deductions, newDeduction],
    });
  };

  // --- Status Change ---
  const handleStatusChange = (e) => {
    setPayslipData({ ...payslipData, status: e.target.value });
  };

  // --- Totals Calculation ---
  const basicSalary = payslipData?.basicSalary ?? 0;
  const allowancesTotal =
    payslipData?.allowances?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) ?? 0;
  const totalDeductions =
    payslipData?.deductions?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) ?? 0;
  const netPay = basicSalary + allowancesTotal - totalDeductions;

  // --- PDF Generation (Using AutoTable for Table Structures) ---
  const generatePDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
  
    // --- Header Section ---
    // Background rectangle for header
    doc.setFillColor(112,66,100); 
    doc.rect(0, 0, 595, 70, "F");
    // Title & date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Drukbooks Payslip", 40, 45);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 450, 45);
    // Underline
    doc.setDrawColor(200, 200, 200);
    doc.line(40, 70, 555, 70);
  
    // --- Employee Details Section ---
    doc.setFontSize(14);
    doc.setTextColor(34, 34, 34);
    doc.text("Employee Details", 40, 90);
    doc.setFontSize(12);
    let y = 110;
    const details = [
      `Name: ${payslipData.employeeId?.name || "N/A"}`,
      `Employee ID: ${payslipData.employeeId?.employeeId || "N/A"}`,
      `Department: ${payslipData.employeeId?.department || "N/A"}`,
      `Bank/Cheque: ${payslipData.bankDetails?.account || "N/A"}`,
      `Basic Salary: Nu. ${basicSalary}`,
      `Duration: ${new Date(payslipData.startDate).toLocaleDateString()} - ${new Date(
        payslipData.endDate
      ).toLocaleDateString()}`
    ];
    details.forEach((line) => {
      doc.text(line, 40, y);
      y += 15;
    });
  
    // --- Salary Summary Section using autoTable ---
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
    headStyles: { fillColor: [112,66,100], textColor: 255 },
    margin: { left: 40, right: 40 },
  });
  y = doc.lastAutoTable.finalY + 20;
  
    // --- Allowances Table ---
    doc.setFontSize(14);
    doc.text("Allowances", 40, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [["Name", "Amount"]],
      body: payslipData.allowances.map((item) => [item.name, `Nu. ${item.amount}`]),
      theme: "striped",
      styles: { halign: "center" },
      headStyles: { fillColor: [112,66,100], textColor: 255 },
      margin: { left: 40, right: 40 },
    });
    
    // --- Deductions Table ---
    y = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text("Deductions", 40, y);
    y += 10;
    doc.autoTable({
      startY: y,
      head: [["Name", "Amount"]],
      body: payslipData.deductions.map((item) => [item.name, `Nu. ${item.amount}`]),
      theme: "striped",
      styles: { halign: "center" },
      headStyles: { fillColor: [112,66,100], textColor: 255 },
      margin: { left: 40, right: 40 },
    });
    
    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Drukbooks", 40, 820);
  
    return doc;
  };
  
  const handleDownloadPDF = () => {
    const doc = generatePDF();
    // Include employee name in file name
    const employeeName = payslipData.employeeId?.name || "employee";
    doc.save(`payslip (${employeeName}).pdf`);
  };
  

  const handlePreviewEmail = () => {
    const doc = generatePDF();
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    setPdfPreviewUrl(blobUrl);
    // Pre-populate with employee email from backend (editable)
    setEmailInput(payslipData.employeeId?.email || "");
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const doc = generatePDF();
      const pdfBase64 = doc.output("datauristring");
      const response = await fetch(`http://localhost:8000/send-payslip-email/${payslipId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailInput, pdf: pdfBase64 }),
      });
      const data = await response.json();
      if (response.ok) {
        setToast({
          show: true,
          type: "success",
          title: "Success",
          message: "Payslip emailed successfully!",
        });
        setShowEmailModal(false);
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Error",
          message: data.error || "Email sending failed",
        });
      }
    } catch (error) {
      console.error("Send email error:", error);
      setToast({
        show: true,
        type: "error",
        title: "Error",
        message: "Email sending failed",
      });
    }
    setSendingEmail(false);
  };

  // --- Update Payslip ---
  const handleUpdatePayslip = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:8000/update-payslip/${payslipId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowances: payslipData.allowances.map(({ isEditing, new: _new, ...rest }) => rest),
          deductions: payslipData.deductions.map(({ isEditing, new: _new, ...rest }) => rest),
          status: payslipData.status,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setToast({
          show: true,
          type: "success",
          title: "Success",
          message: "Payslip updated successfully",
        });
        setPayslipData({
          ...data.payslip,
          allowances: data.payslip.allowances.map((item) => ({ ...item, isEditing: false })),
          deductions: data.payslip.deductions.map((item) => ({ ...item, isEditing: false })),
        });
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Error",
          message: data.error || "Update failed",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      setToast({
        show: true,
        type: "error",
        title: "Error",
        message: "Update failed",
      });
    }
    setUpdating(false);
  };

  if (loading || !payslipData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SlidingCubeLoader loading={true} size={50} color="rgba(74, 144, 226, 1)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Payslip Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold">Payslip</h1>
            <p className="text-gray-600">
              {new Date(payslipData.startDate).toLocaleDateString()} to{" "}
              {new Date(payslipData.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Download & Email Buttons */}
            <div className="bg-gray-100 flex w-40 h-10 border border-gray-300">
              <div
                onClick={handleDownloadPDF}
                className="flex-1 bg-gray-400 p-3 flex justify-center items-center cursor-pointer hover:bg-gray-600"
              >
                <DownloadIcon className="text-white" fontSize="small" />
              </div>
              <div
                onClick={handlePreviewEmail}
                className="flex-1 bg-white p-3 flex justify-center items-center rounded-r-lg cursor-pointer hover:bg-gray-100 border-l border-gray-300"
              >
                <SendIcon className="text-gray-700" fontSize="small" />
              </div>
            </div>
            {/* Status Selector */}
            <select
              value={payslipData.status}
              onChange={handleStatusChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Review Ongoing">Review Ongoing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Paid">Paid</option>
            </select>
            {/* Update Button */}
            <button
              onClick={handleUpdatePayslip}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Payslip"}
            </button>
          </div>
        </div>

        {/* Employee Details & Salary Summary (Responsive Row) */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Employee Details (Smaller) */}
          <div className="flex-1 bg-gray-100 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Employee Details</h2>
            <div className="text-sm text-gray-600">
              <div className="flex">
                <span className="w-32 font-medium">Emp. ID</span>
                <span>: {payslipData.employeeId?.employeeId || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Name</span>
                <span>: {payslipData.employeeId?.name || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Department</span>
                <span>: {payslipData.employeeId?.department || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Bank/Cheque</span>
                <span>: {payslipData.bankDetails?.account || "N/A"}</span>
              </div>
            </div>
          </div>
          {/* Salary Summary */}
          <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-2">Salary Summary</h2>
            <div className="text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>Nu. {basicSalary}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Allowances</span>
                <span>Nu. {allowancesTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions</span>
                <span>Nu. {totalDeductions}</span>
              </div>
              <hr className="my-2" />
              <div className="bg-green-100 flex border-l-4 rounded-2xl border-green-500 text-2xl font-bold p-3 text-center">
              <p className="text-gray-900 text-2xl text-center mt-1">Nu. {netPay}</p>
              {/* <p className="text-gray-500 text-lg text-center mt-1">Employee Net Pay</p> */}
            </div>
            </div>
          </div>
        </div>

        {/* Allowances & Deductions Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Allowances */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Allowances</h2>
              <button onClick={handleAddAllowance} className="text-blue-500">
                <AddIcon />
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {payslipData.allowances.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                  {item.isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={item.name}
                          onChange={(e) => handleAllowanceChange(index, "name", e.target.value)}
                          className="border p-1 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => handleAllowanceChange(index, "amount", e.target.value)}
                          className="border p-1 rounded text-sm w-20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSaveAllowance(index)} className="text-green-500 text-sm">
                          Save
                        </button>
                        <button onClick={() => handleCancelAllowance(index)} className="text-red-500 text-sm">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <EditIcon
                          className="text-gray-400 cursor-pointer"
                          onClick={() => handleEditAllowance(index)}
                          fontSize="small"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>Nu. {item.amount}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Deductions */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Deductions</h2>
              <button onClick={handleAddDeduction} className="text-blue-500">
                <AddIcon />
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {payslipData.deductions.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                  {item.isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={item.name}
                          onChange={(e) => handleDeductionChange(index, "name", e.target.value)}
                          className="border p-1 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => handleDeductionChange(index, "amount", e.target.value)}
                          className="border p-1 rounded text-sm w-20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSaveDeduction(index)} className="text-green-500 text-sm">
                          Save
                        </button>
                        <button onClick={() => handleCancelDeduction(index)} className="text-red-500 text-sm">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <EditIcon
                          className="text-gray-400 cursor-pointer"
                          onClick={() => handleEditDeduction(index)}
                          fontSize="small"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>Nu. {item.amount}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Net Payable (Alternative Display) */}
        <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg flex justify-between items-center">
          <span className="font-semibold">Total Net Payable</span>
          <span className="text-2xl font-bold">Nu. {netPay}</span>
        </div>

        {/* Email Preview Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 relative">
              <h2 className="text-2xl font-bold mb-4">Email Payslip Preview</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4 border rounded">
                {pdfPreviewUrl ? (
                  <iframe
                    src={pdfPreviewUrl}
                    title="PDF Preview"
                    width="100%"
                    height="400px"
                    className="rounded"
                  />
                ) : (
                  <p className="p-4">Generating PDF preview...</p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={3000}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
};

export default Payslip;
