//auth
export { default as Login } from "./Pages/Auth/Login.js";
export { default as SignUp } from "./Pages/Auth/SignUp.js";
export { default as ForgotPassword } from "./Pages/Auth/ForgotPassword.jsx";
export { default as ResetUserPassword } from "./Pages/Auth/ResetUserPassword.jsx";
export { default as ResetEmployeePassword } from "./Pages/Auth/ResetEmployeePassword.jsx";
export { default as OwnerDashboard } from "./Pages/Dashboard/Owner/OwnerDashboard.jsx";
//-Accountant

//AccountantDashBoard
export { default as AccDashboard } from "./Pages/Dashboard/Accountant/AccDashboard.jsx";

//Bank
export { default as AddBank } from "./Pages/Finance/Accountant/Banking/AddBank.jsx";
export { default as Banking } from "./Pages/Finance/Accountant/Banking/Banking.jsx";
//Banking
export { default as ChartsOfAccount } from "./Pages/Finance/Accountant/ChartsOfAccount/ChartsOfAccount.jsx";
//Banking/ManualJournal
export { default as AddManualJournal } from "./Pages/Finance/Accountant/ManualJournal/AddManualJournal/AddManualJournal.jsx";
export { default as EditJournal } from "./Pages/Finance/Accountant/ManualJournal/EditJournal/EditJournal.jsx";
export { default as ImportJournal } from "./Pages/Finance/Accountant/ManualJournal/ImportJournal.jsx";
export { default as ManualJournal } from "./Pages/Finance/Accountant/ManualJournal/ManualJournal";
export { default as ViewJournal } from "./Pages/Finance/Accountant/ManualJournal/ViewJournal/ViewJournal.jsx";
//-sales
//Income
export { default as EditIncome } from "./Pages/Finance/Income/EditIncome.js";
export { default as Income } from "./Pages/Finance/Income/Income.js";
export { default as NewIncome } from "./Pages/Finance/Income/NewIncome.js";

//Invoice
export { default as InvoicePDF } from "./Pages/Finance/Invoice/Components/InvoicePDF.js";
export { default as EditInvoice } from "./Pages/Finance/Invoice/EditInvoice.js";
export { default as Invoice } from "./Pages/Finance/Invoice/invoice.js";
export { default as NewInvoice } from "./Pages/Finance/Invoice/NewInvoice.js";

export { default as EditExpense } from "./Pages/Finance/Expense/EditExpense.js";
export { default as Expense } from "./Pages/Finance/Expense/Expense.js";
export { default as NewExpense } from "./Pages/Finance/Expense/NewExpense.js";

export { default as QuotationPDF } from "./Pages/Finance/Quotation/Components/QuotationPDF.js";
export { default as EditQuotation } from "./Pages/Finance/Quotation/EditQuotation.js";
export { default as NewQuotation } from "./Pages/Finance/Quotation/NewQuotation.js";
export { default as Quotation } from "./Pages/Finance/Quotation/Quotation.js";
export { default as Reports } from "./Pages/Finance/Reports/report.jsx";

export { default as InvoiceQuotationImport } from "./Pages/Finance/InvoiceQuotationImport.jsx";

// reports

export { default as BalanceSheet } from "./Pages/Finance/Reports/BalanceSheet/BalanceSheet.js";
export { default as CashFlowStatement } from "./Pages/Finance/Reports/CashFlowStatement/CashFlow.jsx";
export { default as ProfitandLoss } from "./Pages/Finance/Reports/ProfitandLoss/ProfitandLoss.jsx";
export { default as TrialBalance } from "./Pages/Finance/Reports/TrialBalance/TrialBalance.jsx";

// HR
//HrDashboard
export { default as HRDashboard } from "./Pages/Dashboard/HR/HrDashboard.jsx";

//Payslip
export { default as PaySlip } from "./Pages/HR/Payslip/paySlip.jsx";
export { default as Allowances } from "./Pages/HR/Payslip/Allowances/Allowances.jsx";
export { default as Deductions } from "./Pages/HR/Payslip/Deductions/Deductions.jsx";
export { default as Reimbursements } from "./Pages/HR/Payslip/Reimbursements/Reimbursements.jsx";
export { default as AdvanceSalary } from "./Pages/HR/Payslip/AdvanceSalary/AdvanceSalary.jsx";
//StaffInfo
export { default as AddNewStaff } from "./Pages/HR/StaffInfo/addnewStaff.jsx";
export { default as StaffDetails } from "./Pages/HR/StaffInfo/staffDetails.jsx";
export { default as StaffInformation } from "./Pages/HR/StaffInfo/staffInformation.jsx";
export { default as Unauthorized } from "./Pages/Unauthorized.js";
//Leave
export { default as Leave } from "./Pages/HR/Leave/leave.jsx";

//RoleAndDepartmentSettings
export { default as RoleAndDepartmentSettings } from "./Pages/HR/RoleAndDepartmentSettings/RoleAndDepartmentSettings.jsx";

//users and roles
export { default as UsersNRoles } from "./Pages/HR/User&Roles/UsersNRoles.jsx";

//Employee
export { default as EmployeeDashboard } from "./Pages/Employee/EmployeeDashboard.jsx";
export { default as LeavePage } from "./Pages/Employee/LeavePage.jsx";
export { default as LeaveCard } from "./Pages/Employee/LeaveType/LeaveCard.jsx";
export { default as LeaveRequestForm } from "./Pages/Employee/LeaveRequestForm.jsx";
export { default as LeaveRequest } from "./Pages/Employee/LeaveRequest.jsx";
export { default as Payslips } from "./Pages/Employee/PaySlipEmployee/PaySlipEmployee.jsx";
export { default as AdvanceSalarys } from "./Pages/Employee/AdvanceSalary/AdvanceSalary.jsx";

//Setting
export { default as Setting } from "./Pages/Setting/Owner/Setting.jsx";
export { default as SettingEmp } from "./Pages/Setting/Employee/SettingEmp.jsx";

//scheduleMeeting
export { default as ScheduleMeeting } from "./Pages/SchelduleMeeting/SchelduleMeeting.jsx";

//interviewSchedule
export { default as InterviewSchedule } from "./Pages/InterviewScheduler/InterviewScheduler.jsx";