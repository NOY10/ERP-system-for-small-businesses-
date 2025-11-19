import React, { useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";

const AdvanceSalaryForm = ({
  formType,
  formData = {},
  handleChange,
  handleSave,
  setShowForm,
}) => {
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [percentageWarning, setPercentageWarning] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");

  // Initialize form data when editing
  useEffect(() => {
    if (formType === "edit" && formData.employee) {
      setSearchTerm(formData.employee);
    }
  }, [formType, formData.employee]);

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch("http://localhost:8000/getallEmployees", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const formattedEmployees = data.employees.map((emp) => ({
            id: emp._id,
            employeeId: emp.employeeId,
            name: emp.name,
            salary: emp.salary,
          }));
          setEmployees(formattedEmployees);
        } else {
          console.error("Failed to fetch employees:", data.error);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [token]);

  console.log("employees", employees);

  // Calculate total installments when amount or installment amount changes
  useEffect(() => {
    const advanceAmount = parseFloat(formData.amount);
    const installmentAmount = parseFloat(formData.installmentAmount);

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

  const handleSelectEmployee = (emp) => {
    setSearchTerm(emp.name);
    setShowDropdown(false);
    handleChange({ target: { name: "employee", value: emp.name } });
    handleChange({ target: { name: "employeeId", value: emp.id } });
    handleChange({
      target: { name: "employeeSalary", value: emp.salary.toString() },
    });
  };

  const handleInstallmentAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    const salary = parseFloat(formData.employeeSalary);
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

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Employee Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee *</label>
            <input
              type="text"
              name="employee"
              value={user.name || ""}
              readOnly
              className="border w-full p-2 rounded-md bg-gray-100"
            />
          </div>
          {/* <div className="relative">
            <label className="block text-sm font-medium mb-1">Employee *</label>
            
            {isSearchMode ? (
              <>
                <input
                  type="text"
                  name="employee"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="border w-full p-2 rounded-md"
                  placeholder="Search employee..."
                  autoComplete="off"
                  required
                />
                <div
                  className="absolute top-9 right-2 cursor-pointer"
                  onClick={toggleSearchMode}
                >
                  ▲
                </div>

                {showDropdown && filteredEmployees.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
                    {filteredEmployees.map((emp) => (
                      <li
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {`${emp.name} [${emp.employeeId}]`}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={user.name || ""}
                  readOnly
                  className="border w-full p-2 rounded-md bg-gray-100"
                />
                <div
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={toggleSearchMode}
                >
                  ▼
                </div>
              </div>
            )}
          </div> */}

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
              Employee Monthly Salary *
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
              Total Installment Periods *
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
