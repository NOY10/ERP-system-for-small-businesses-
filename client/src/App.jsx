import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Drawer from "./Components/Drawer.jsx";
import Header from "./Components/Header.jsx";
import ProtectedRoute from "./Components/ProtectedRoutes.jsx";

import useAppStore from "./store/useAppStore";
import {
  AccDashboard,
  AddBank,
  AddManualJournal,
  AddNewStaff,
  Allowances,
  BalanceSheet,
  Banking,
  CashFlowStatement,
  ChartsOfAccount,
  Deductions,
  EditExpense,
  EditIncome,
  EditInvoice,
  EditJournal,
  EditQuotation,
  EmployeeDashboard,
  Expense,
  HRDashboard,
  ImportJournal,
  Income,
  Invoice,
  InvoicePDF,
  Leave,
  LeaveCard,
  LeaveRequest,
  LeaveRequestForm,
  Login,
  ManualJournal,
  NewExpense,
  NewIncome,
  NewInvoice,
  NewQuotation,
  OwnerDashboard,
  PaySlip,
  ProfitandLoss,
  Quotation,
  QuotationPDF,
  Reimbursements,
  AdvanceSalary,
  Reports,
  SignUp,
  StaffDetails,
  StaffInformation,
  TrialBalance,
  Unauthorized,
  RoleAndDepartmentSettings,
  UsersNRoles,
  ViewJournal,
  ForgotPassword,
  Setting,
  SettingEmp,
  ResetUserPassword,
  ResetEmployeePassword,
  Payslips,
  AdvanceSalarys,
  LeavePage,
  ScheduleMeeting,
  InvoiceQuotationImport,
  InterviewSchedule,
} from "./import";
import TransactionRecord from "./Pages/Finance/Accountant/ChartsOfAccount/Records/TransactionRecords.jsx";
import useAuthStore from "./store/useAuthStore.jsx";

const INACTIVITY_LIMIT = 3600000; // 1 hour in milliseconds

const App = () => {
  const activeMenu = useAppStore((s) => s.activeMenu);
  const { token, user, logout } = useAuthStore();

  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    // Update the timestamp for user activity
    const updateActivity = () => setLastActivity(Date.now());

    // Attach user interaction events
    const events = ["mousemove", "keydown", "click"];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  useEffect(() => {
    // Check for user inactivity with debouncing
    const checkActivity = () => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed > INACTIVITY_LIMIT) {
        // alert("You have been logged out due to inactivity.");
        logout(); // Logout user
      }
    };

    const interval = setInterval(checkActivity, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [lastActivity, logout]);

  useEffect(() => {
    // Token expiration checker
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decodedToken.exp < now) {
          alert("Your session has expired. Please log in again.");
          logout();
        }
      } catch (error) {
        console.error("Invalid token detected:", error);
        logout();
      }
    }
  }, [token, logout]);

  // Function to generate role-specific routes
  const getRoutesByRole = () => {
    if (!user) return [];
    switch (user.role) {
      case "Owner":
        return [
          { path: "/OwnerDashboard", element: <OwnerDashboard /> },
          {path: "/scheduleMeeting", element: <ScheduleMeeting />},
          { path: "/expense", element: <Expense /> },
          { path: "/income", element: <Income /> },
          { path: "/newIncome", element: <NewIncome /> },
          { path: "/newExpense", element: <NewExpense /> },
          { path: "/editExpense", element: <EditExpense /> },
          { path: "/editIncome", element: <EditIncome /> },
          { path: "/leave", element: <Leave /> },
          //Payslips
          { path: "/payslip/:payslipId", element: <PaySlip /> },
          { path: "Payslip/Allowances", element: <Allowances /> },
          { path: "Payslip/Deductions", element: <Deductions /> },
          { path: "Payslip/Reimbursements", element: <Reimbursements /> },
          { path: "Payslip/AdvanceSalary", element: <AdvanceSalary /> },
          //
          { path: "/staffInfo", element: <StaffInformation /> },
          { path: "/invoice", element: <Invoice /> },
          { path: "/quotation", element: <Quotation /> },
          { path: "/Quotation/NewQuotation", element: <NewQuotation /> },
          { path: "/Quotation/editQuotation", element: <EditQuotation /> },
          //accountant
          { path: "/Banking", element: <Banking /> },
          { path: "/Banking/AddAccount", element: <AddBank /> },
          { path: "/ManualJournal", element: <ManualJournal /> },
          { path: "/ChartsOfAccount", element: <ChartsOfAccount /> },
          {
            path: "/ManualJournal/Add",
            element: <AddManualJournal />,
          },
          { path: "/ManualJournal/ImportJournal", element: <ImportJournal /> },
          { path: "/ManualJournal/View/:id", element: <ViewJournal /> },
          { path: "/ManualJournal/Edit/:id", element: <EditJournal /> },
          //
          { path: "QuotationPDF", element: <QuotationPDF /> },
          { path: "InvoicePDF", element: <InvoicePDF /> },
          { path: "/Invoice/NewInvoice", element: <NewInvoice /> },
          { path: "/Invoice/EditInvoice", element: <EditInvoice /> },
          { path: "/Reports", element: <Reports /> },
          { path: "/Reports/BalanceSheet", element: <BalanceSheet /> },
          { path: "/Reports/TrialBalance", element: <TrialBalance /> },
          { path: "/Reports/ProfitandLoss", element: <ProfitandLoss /> },
          { path: "/staffInfo", element: <StaffInformation /> },
          { path: "/staff/:id", element: <StaffDetails /> },
          { path: "/StaffInfo/addnewStaff", element: <AddNewStaff /> },

          {
            path: "/Reports/CashFlowStatement",
            element: <CashFlowStatement />,
          },
          {
            path: "/TransactionRecord",
            element: <TransactionRecord />,
          },
          {
            path: "/RoleAndDepartmentSettings",
            element: <RoleAndDepartmentSettings />,
          },
          {
            path: "/UsersAndRoles",
            element: <UsersNRoles />,
          },
          {path: "/schedule-interview", element: <InterviewSchedule />},
          {
            path: "/Setting",
            element: <Setting />,
          },
          {
            path: "/forgot_password",
            element: <ForgotPassword />,
          },
          {
            path: "/import/:type",
            element: <InvoiceQuotationImport />,
          },
        ];
      case "HR":
        return [
          { path: "/HRDashboard", element: <HRDashboard /> },
          { path: "/leave", element: <Leave /> },
          { path: "/payslip", element: <PaySlip /> },
          //Payslips
          { path: "/payslip/:payslipId", element: <PaySlip /> },
          { path: "Payslip/Allowances", element: <Allowances /> },
          { path: "Payslip/Deductions", element: <Deductions /> },
          { path: "Payslip/Reimbursements", element: <Reimbursements /> },
          { path: "Payslip/AdvanceSalary", element: <AdvanceSalary /> },
          {
            path: "/RoleAndDepartmentSettings",
            element: <RoleAndDepartmentSettings />,
          },
          { path: "/staffInfo", element: <StaffInformation /> },
          { path: "/staff/:id", element: <StaffDetails /> },
          { path: "/StaffInfo/addnewStaff", element: <AddNewStaff /> },
          {
            path: "/UsersAndRoles",
            element: <UsersNRoles />,
          },
          {path: "/schedule-interview", element: <InterviewSchedule />},
          {
            path: "/SettingEmp",
            element: <SettingEmp />,
          },
          {
            path: "/forgot_password",
            element: <ForgotPassword />,
          },
          {path: "/scheduleMeeting", element: <ScheduleMeeting />},
        ];
      case "Accounts":
        return [
          {path: "/schedule-interview", element: <InterviewSchedule />},
          { path: "/AccountsDashboard", element: <AccDashboard /> },
          { path: "/expense", element: <Expense /> },
          { path: "/income", element: <Income /> },
          { path: "/newIncome", element: <NewIncome /> },
          { path: "/newExpense", element: <NewExpense /> },
          { path: "/editExpense", element: <EditExpense /> },
          { path: "/editIncome", element: <EditIncome /> },
          { path: "/leave", element: <Leave /> },
          { path: "/payslip", element: <PaySlip /> },
          { path: "/staffInfo", element: <StaffInformation /> },
          { path: "/invoice", element: <Invoice /> },
          { path: "/quotation", element: <Quotation /> },
          { path: "/Quotation/NewQuotation", element: <NewQuotation /> },
          { path: "/Quotation/editQuotation", element: <EditQuotation /> },
          //accountant
          { path: "/Banking", element: <Banking /> },
          { path: "/Banking/AddAccount", element: <AddBank /> },
          { path: "/ManualJournal", element: <ManualJournal /> },
          { path: "/ChartsOfAccount", element: <ChartsOfAccount /> },
          {
            path: "/ManualJournal/Add",
            element: <AddManualJournal />,
          },

          { path: "/ManualJournal/ImportJournal", element: <ImportJournal /> },
          { path: "/ManualJournal/View/:id", element: <ViewJournal /> },
          { path: "/ManualJournal/Edit/:id", element: <EditJournal /> },
          //
          { path: "QuotationPDF", element: <QuotationPDF /> },
          { path: "InvoicePDF", element: <InvoicePDF /> },
          { path: "/Invoice/NewInvoice", element: <NewInvoice /> },
          { path: "/Invoice/EditInvoice", element: <EditInvoice /> },
          { path: "/Reports", element: <Reports /> },
          { path: "/Reports/BalanceSheet", element: <BalanceSheet /> },
          { path: "/Reports/TrialBalance", element: <TrialBalance /> },
          { path: "/Reports/ProfitandLoss", element: <ProfitandLoss /> },
          {path: "/scheduleMeeting", element: <ScheduleMeeting />},
          {
            path: "/Reports/CashFlowStatement",
            element: <CashFlowStatement />,
          },
          {
            path: "/SettingEmp",
            element: <SettingEmp />,
          },
          {
            path: "/forgot_password",
            element: <ForgotPassword />,
          },
          {
            path: "/import/:type",
            element: <InvoiceQuotationImport />,
          },
        ];
      case "Employee":
        return [
          { path: "/EmployeeDashboard", element: <EmployeeDashboard /> },
          { path: "/LeaveCard", element: <LeaveCard /> },
          { path: "/LeaveRequestForm", element: <LeaveRequestForm /> },
          { path: "/LeaveRequest", element: <LeaveRequest /> },
          { path: "/AdvanceSalary", element: <AdvanceSalarys /> },
          { path: "/PaySlip", element: <Payslips /> },
          { path: "/Leave", element: <LeavePage /> },
          {
            path: "/SettingEmp",
            element: <SettingEmp />,
          },
          {
            path: "/forgot_password",
            element: <ForgotPassword />,
          },
        ];

      default:
        return [];
    }
  };

  const roleRoutes = getRoutesByRole();

  return (
    <div className="bg-[rgb(243,246,244)]">
      {user ? (
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed top-0 left-0 h-full dark:bg-secondary-dark-bg bg-white z-40">
            <Drawer />
          </div>
          <div
            className={`${
              activeMenu ? "md:ml-72" : "md:ml-[70px] left-[70px]"
            } dark:bg-main-dark-bg bg-main-bg min-h-screen flex-1`}
          >
            <div
              className={`fixed top-0 z-20 bg-main-bg dark:bg-main-dark-bg navbar transition-all w-full ${
                activeMenu ? "md:left-72 md:pr-[300px]" : "md:pr-20"
              }`}
            >
              <Header />
            </div>
            <div className="p-6 mt-[45px]">
              <Routes>
                {roleRoutes.map(({ path, element }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <ProtectedRoute allowedRoles={[user.role]}>
                        {element}
                      </ProtectedRoute>
                    }
                  />
                ))}
                <Route
                  path="*"
                  element={
                    user && user.role ? (
                      user.role === "Employee" ? (
                        <Navigate to={`/Leave`} replace />
                      ) : (
                        <Navigate to={`/${user.role}Dashboard`} replace />
                      )
                    ) : (
                      <Navigate to="/unauthorized" replace />
                    )
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          {/* Public Routes */}

          <Route path="/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route
            path="/ResetUserPassword/:token"
            element={<ResetUserPassword />}
          />
          <Route
            path="/ResetEmployeePassword/:token"
            element={<ResetEmployeePassword />}
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
