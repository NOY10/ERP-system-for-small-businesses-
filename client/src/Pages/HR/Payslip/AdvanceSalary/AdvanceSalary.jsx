import React, { useState, useEffect } from "react";
import AdvanceSalaryList from "./AdvanceSalaryList";
import AdvanceSalaryForm from "./AdvanceSalaryForm";
import AdvanceTable from "./AdvanceTable";
import AdvanceSalaryRequests from "./AdvanceSalaryRequests";
import useAuthStore from "../../../../store/useAuthStore";
import DialogBox from "../../../../Components/Dialogbox";
import { Alert, Snackbar } from "@mui/material";


import { API_BASE_URL } from "../../../../config/api";

const AdvancedSalary = () => {
  const { token, user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState({
    title: "",
    employee: "",
    employeeId: "",
    employeeSalary: "",
    amount: "",
    providedDate: "",
    installmentAmount: "",
    totalInstallments: "",
    description: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentView, setCurrentView] = useState("list");
  const [activeTab, setActiveTab] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [approveEmployee, setApproveEmployee] = useState([]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/getAllAdvanceSalaries`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          // Include both Pending and Rejected in employees
          const filteredEmployees = data.advanceSalaries
            .filter(
              (employee) =>
                employee.status === "Pending" || employee.status === "Rejected"
            )
            .map((employee, index) => ({
              ...employee,
            }));

          // Approved requests go to approveEmployee
          const approvedEmployees = data.advanceSalaries
            .filter((employee) => employee.status === "Approved")
            .map((employee, index) => ({
              ...employee,
            }));

          setEmployees(filteredEmployees);
          setApproveEmployee(approvedEmployees);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchEmployees();
  }, [token]);

  // ** Create New Employee **
  const handleCreate = () => {
    setFormType("create");
    setSelectedEmployee({
      title: "",
      employee: "",
      employeeId: "",
      employeeSalary: "",
      amount: "",
      providedDate: "",
      installmentAmount: "",
      totalInstallments: "",
      description: "",
    });
    setShowForm(true);
  };

  // ** Save (Create or Update) Employee **

  const handleSave = async () => {
    if (!selectedEmployee) return;

    try {
      const url =
        formType === "edit"
          ? `${API_BASE_URL}/updateAdvanceSalary/${selectedEmployee._id}`
          : `${API_BASE_URL}/addAdvanceSalary`;

      const method = formType === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedEmployee),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: selectedEmployee._id? "Advance Salary updated successfully!": "Advance Salary requested successfully",
          severity: "success",
        });

        // Refetch the data to ensure UI is in sync with backend
        const refreshResponse = await fetch(
          `${API_BASE_URL}/getAllAdvanceSalaries`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok) {
          const filteredEmployees = refreshData.advanceSalaries
            .filter((employee) => employee.status === "Pending")
            .map((employee, index) => ({
              ...employee,
            }));

          const approvedEmployees = refreshData.advanceSalaries
            .filter((employee) => employee.status === "Approved")
            .map((employee, index) => ({
              ...employee,
            }));

          setEmployees(filteredEmployees);
          setApproveEmployee(approvedEmployees);
        }

        setShowForm(false);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data");
    }
  };
  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === "Rejected") {
        // First delete the request from the database
        const deleteResponse = await fetch(
          `${API_BASE_URL}/deleteAdvanceSalary`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: [id] }),
          }
        );

        const deleteData = await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(
            deleteData.error || "Failed to delete rejected request"
          );
        }

        // Then update the UI by removing from pending list
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
        setSnackbar({
          open: true,
          message: "Advance Salary request rejected successfully",
          severity: "success",
        });
      } else {
        // For approved requests, just update the status
        const response = await fetch(
          `${API_BASE_URL}/updateAdvanceSalary/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (status === "Approved") {
            const approvedEmployee = employees.find((emp) => emp._id === id);
            if (approvedEmployee) {
              setEmployees((prev) => prev.filter((emp) => emp._id !== id));
              setApproveEmployee((prev) => [
                ...prev,
                { ...approvedEmployee, status: "Approved" },
              ]);
            }
          }
          // alert(`Request ${status.toLowerCase()} successfully`);
          setSnackbar({
            open: true,
            message: `Request ${status.toLowerCase()} successfully`,
            severity: "success",
          });
        } else {
          throw new Error(data.error || "Failed to update status");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  // ** Edit Employee **
  const handleEdit = (employee) => {
    setSelectedEmployee({
      _id: employee._id,
      title: employee.title || "",
      employee: employee.employee || "",
      employeeId: employee.employeeId || "",
      employeeSalary: employee.employeeSalary || "",
      amount: employee.amount || "",
      providedDate: employee.providedDate || "",
      installmentAmount: employee.installmentAmount || "",
      totalInstallments: employee.totalInstallments || "",
      description: employee.description || "",
      status: "Approved",
    });
    setFormType("edit");
    setShowForm(true);
  };

  // ** Delete Employee **
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/deleteAdvanceSalary`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [id] }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // alert("Advance salary request deleted successfully");
        setSnackbar({
          open: true,
          message: "Advance salary request deleted successfully",
          severity: "success",
        });

        // Remove from pending list (employees)
        setEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp._id !== id)
        );

        // Remove from approved list (approveEmployee)
        setApproveEmployee((prevApproved) =>
          prevApproved.filter((emp) => emp._id !== id)
        );
        setShowForm(false);
      } else {
        alert(data.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry");
    }
  };

  return (
    <>
    <div className="p-4 bg-gray-50">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Advanced Salary
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
  <div className="relative w-full md:w-64">
    <input
      type="text"
      placeholder="Search ..."
      className="pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  <div className="flex items-center bg-gray-100 p-1 rounded-md">
    <button onClick={() => setCurrentView("table")}>
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
    <button onClick={() => setCurrentView("list")}>
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    </button>
  </div>
  {user?.role !== "Owner" && (
    <button
      onClick={handleCreate}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Advance Salary
    </button>
  )}
</div>
        </div>
      </div>
      <div className="border border-gray-200">
        {/* Tab Navigation */}
        <div className="flex ">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-grow px-6 py-2  transition-colors font-medium ${
              activeTab === 1 ? "bg-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Advance Salary Request
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-grow px-6 py-2 transition-colors font-medium ${
              activeTab === 2 ? "bg-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Advance Salary
          </button>
        </div>

        {/* Conditional Rendering for Tabs */}
        {activeTab === 1 ? (
          // Tab 1: Empty content
          <div className="text-gray-500 bg-white">
            <AdvanceSalaryRequests
              requests={employees}
              onStatusUpdate={handleStatusUpdate}
            />
            ;
          </div>
        ) : activeTab === 2 ? (
          // Tab 2: Advanced Salary content
          <div>
            {/* Conditionally Render the Components for Tab 2 */}
            {currentView === "list" ? (
              <AdvanceSalaryList
                employees={approveEmployee}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ) : 
            currentView === "table" ? (
              <AdvanceTable
                loans={approveEmployee}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ) : null}
          </div>
        ) : null}

        {/* Employee Form for Creating / Editing */}
        <DialogBox
          title=""
          isVisible={showForm}
          onClose={() => setShowForm(false)}
        >
          <AdvanceSalaryForm
            formType={formType}
            formData={selectedEmployee || {}}
            handleChange={(e) =>
              setSelectedEmployee((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            handleSave={handleSave}
            setShowForm={setShowForm}
          />
        </DialogBox>
      </div>
    </div>
    <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }} 
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            color: "white",
            backgroundColor: snackbar.severity === "success" ? "#22c55e" : "#ef4444",
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

export default AdvancedSalary;
