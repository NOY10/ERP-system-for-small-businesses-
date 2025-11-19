import React, { useEffect, useState } from "react";
import useAuthStore from "../../../store/useAuthStore";

const AdvanceSalaryForm = ({
  formType,
  formData = {},
  handleChange,
  handleSave,
  setShowForm,
}) => {
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [percentageWarning, setPercentageWarning] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");

  // Initialize form data when editing
  useEffect(() => {
    if (formType === "edit") {
      // For edit mode, use the existing formData
      if (formData.employee) {
        setEmployeeData({
          id: formData.employeeId,
          name: formData.employee,
          salary: formData.employeeSalary,
        });
      }
    } else {
      // For create mode, fetch current employee data
      fetchEmployeeData();
    }
  }, [formType]);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/getSingleEmployee/${user?.employeeId}`,
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
        const employee = data.employee;
        setEmployeeData({
          id: employee.employeeId,
          name: employee.name,
          salary: employee.salary,
        });

        // Pre-fill employee data in the form
        handleChange({ target: { name: "employee", value: employee.name } });
        handleChange({
          target: { name: "employeeId", value: employee._id },
        });
        handleChange({
          target: { name: "employeeSalary", value: employee.salary.toString() },
        });
      } else {
        console.error("Failed to fetch employee:", data.error);
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("employeeData", employeeData);

  // Calculate total installments
  useEffect(() => {
    const advanceAmount = parseFloat(formData.amount || 0);
    const installmentAmount = parseFloat(formData.installmentAmount || 0);

    if (
      !isNaN(advanceAmount) &&
      !isNaN(installmentAmount) &&
      installmentAmount > 0
    ) {
      const calculatedTotalInstallments = Math.ceil(
        advanceAmount / installmentAmount
      );
      setTotalInstallments(calculatedTotalInstallments);
      handleChange({
        target: {
          name: "totalInstallments",
          value: calculatedTotalInstallments.toString(),
        },
      });
    } else {
      setTotalInstallments("");
    }
  }, [formData.amount, formData.installmentAmount]);

  const handleInstallmentAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    const salary = parseFloat(formData.employeeSalary || 0);

    if (value < 0) {
      setPercentageWarning("Installment amount cannot be negative");
    } else if (value > salary) {
      setPercentageWarning(
        `Installment amount cannot exceed salary of ${salary}`
      );
    } else {
      setPercentageWarning("");
    }

    handleChange(e);
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.employee &&
      formData.amount &&
      formData.providedDate &&
      formData.employeeSalary &&
      formData.installmentAmount &&
      !percentageWarning &&
      formData.description
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {formType === "edit" ? "Edit Advanced Salary" : "New Advanced Salary"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="border w-full p-2 rounded-md"
              required
            />
          </div>

          {/* Employee (readonly for non-HR/Owner) */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee *</label>
            <input
              type="text"
              name="employee"
              value={formData.employee || ""}
              readOnly
              className="border w-full p-2 rounded-md bg-gray-100"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ""}
              onChange={handleChange}
              className="border w-full p-2 rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Provided Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Provided Date *
            </label>
            <input
              type="date"
              name="providedDate"
              value={formData.providedDate || ""}
              onChange={handleChange}
              className="border w-full p-2 rounded-md"
              required
            />
          </div>

          {/* Employee Salary (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Salary *
            </label>
            <input
              type="number"
              name="employeeSalary"
              value={formData.employeeSalary || ""}
              readOnly
              className="border w-full p-2 rounded-md bg-gray-100"
            />
          </div>

          {/* Installment Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Installment Amount *
            </label>
            <input
              type="number"
              name="installmentAmount"
              value={formData.installmentAmount || ""}
              onChange={handleInstallmentAmountChange}
              className="border w-full p-2 rounded-md"
              min="0"
              step="0.01"
              required
            />
            {percentageWarning && (
              <p className="text-red-500 text-sm mt-1">{percentageWarning}</p>
            )}
          </div>

          {/* Total Installments (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Installment Periods *
            </label>
            <input
              type="text"
              name="totalInstallments"
              value={totalInstallments || ""}
              readOnly
              className="border w-full p-2 rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="border w-full p-2 rounded-md"
            rows="3"
            required
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`px-4 py-2 rounded-md text-white ${
              !isFormValid()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {formType === "edit" ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvanceSalaryForm;
