import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../Components/Toast";
import ToggleSwitch from "../../../../Components/ToggleSwitch";
import useAuthStore from "../../../../store/useAuthStore";
const pastelColors = [
  '#f07167', '#335c67', '#7f5539', '#f28482', '#f5cac3',
  '#6b705c', '#cb997e', '#9d6b53', '#c9cba3', '#eae0d5',
  '#b392ac', '#735d78', '#e27396', '#f29559', '#acd8aa'
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

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
// EmployeeChip Component
const EmployeeChip = ({ employee, onRemove, bgColor }) => (
  <div className={`flex items-center ${bgColor} rounded-full py-1 px-3`}>
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-2"
      style={{ backgroundColor: getRandomColor(employee.id) }}
    >
      {employee.initials}
    </div>
    <span className="text-sm">{employee.name}</span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove(employee.id);
      }}
      className="ml-2 text-gray-500 hover:text-gray-700"
    >
      ×
    </button>
  </div>
);

// EmployeeSelectionModal Component
const EmployeeSelectionModal = ({ 
  employees, 
  selectedIds, 
  onSelect, 
  onClose, 
  title 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {employees.map(employee => (
          <div
            key={employee.id}
            onClick={() => onSelect(employee)}
            className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded ${
              selectedIds.includes(employee.id) ? "bg-blue-50" : ""
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: getRandomColor(employee.id) }}
            >
              {employee.initials}
            </div>
            <span>{employee.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
);

const AllowanceModal = ({ onClose, onSave, editingAllowance }) => {
  const [employees, setEmployees] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [isIncludeListOpen, setIsIncludeListOpen] = useState(false);
  const [isExcludeListOpen, setIsExcludeListOpen] = useState(false);
  const { token } = useAuthStore();
  const navigate = useNavigate(); 
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!allowance.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!allowance.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!allowance.amount || isNaN(allowance.amount) || parseFloat(allowance.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    
    if (!allowance.includeAll && allowance.includedEmployees.length === 0) {
      newErrors.includedEmployees = "At least one employee must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [allowance, setAllowance] = useState({
    title: "",
    description: "",
    amount: "",
    includeAll: true,
    includedEmployees: [],
    excludedEmployees: [],
  });

  useEffect(() => {
    if (editingAllowance) {
      setAllowance({
        title: editingAllowance.name, // Use 'name' from API
        description: editingAllowance.description,
        amount: editingAllowance.defaultAmount, // Use 'defaultAmount' from API
        includeAll: editingAllowance.appliesTo === "All", // Map appliesTo to includeAll
        includedEmployees: [],
        excludedEmployees: [],
      });
    }
  }, [editingAllowance]);
  useEffect(() => {
    if (editingAllowance && employees.length > 0) {
      const included = editingAllowance.includedEmployees.map(id => 
        employees.find(e => e.id === id)
      ).filter(Boolean);
      const excluded = editingAllowance.excludedEmployees.map(id => 
        employees.find(e => e.id === id)
      ).filter(Boolean);
  
      setAllowance(prev => ({
        ...prev,
        includedEmployees: included,
        excludedEmployees: excluded,
      }));
    }
  }, [employees, editingAllowance]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        
        const response = await fetch('http://localhost:8000/getallEmployees', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
            initials: getInitials(emp.name),
          }));
          setEmployees(formattedEmployees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
  
    // Handle number inputs as strings to prevent NaN issues
    if (type === "number") {
      setAllowance((prev) => ({
        ...prev,
        [name]: value, // Store as string
      }));
    } else {
      // Handle other inputs normally
      setAllowance((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const toggleEmployee = (list, employee) => {
    const isPresent = list.some(emp => emp.id === employee.id);
    return isPresent 
      ? list.filter(emp => emp.id !== employee.id)
      : [...list, employee];
  };
  const handleAddIncludedEmployee = (employee) => {
    setAllowance(prev => ({
      ...prev,
      includedEmployees: toggleEmployee(prev.includedEmployees, employee)
    }));
  };

  const handleAddExcludedEmployee = (employee) => {
    setAllowance(prev => ({
      ...prev,
      excludedEmployees: toggleEmployee(prev.excludedEmployees, employee)
    }));
  };

  const handleRemoveIncludedEmployee = (employeeId) => {
    setAllowance(prev => ({
      ...prev,
      includedEmployees: prev.includedEmployees.filter(emp => emp.id !== employeeId),
    }));
  };

  

  const handleRemoveExcludedEmployee = (employeeId) => {
    setAllowance(prev => ({
      ...prev,
      excludedEmployees: prev.excludedEmployees.filter(emp => emp.id !== employeeId),
    }));
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
  
    const allowanceData = {
      name: allowance.title,
      description: allowance.description,
      defaultAmount: parseFloat(allowance.amount),
      appliesTo: allowance.includeAll ? "All" : "Specific",
      includedEmployees: allowance.includedEmployees.map(e => e.id),
      excludedEmployees: allowance.excludedEmployees.map(e => e.id),
    };
  
    
      await onSave(allowanceData); // Wait for the save operation to complete
      
      
      // onclose();// Navigate back after successful save
    
  };
  return(
    
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {editingAllowance ? "Edit Allowance" : "New Allowance"}
            </h2>
    
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={allowance.title}
                      onChange={handleInputChange}
                    />
                     {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={allowance.amount}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
                </div>
    
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={allowance.description}
                    onChange={handleInputChange}
                  />
                  {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
                </div>
              </div>
    
              {/* Employee Selection Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Selection</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Apply to all employees</h4>
                    <p className="text-sm text-gray-500">
                      {allowance.includeAll
                        ? "Applies to all employees except excluded"
                        : "Applies only to selected employees"}
                    </p>
                  </div>
                  <ToggleSwitch
                    isOn={allowance.includeAll}
                    handleToggle={() => setAllowance((prev) => ({
                      ...prev,
                      includeAll: !prev.includeAll,
                    }))}
                    
                  />
                </div>
    
                {/* Include/Exclude Employee Lists */}
                {!allowance.includeAll && (
                  <div className="p-4 border rounded-lg mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Included Employees</label>
                    <div
                      className="min-h-[100px] p-3 border-2 border-dashed rounded-lg cursor-pointer"
                      onClick={() => setIsIncludeListOpen(true)}
                    >
                      {allowance.includedEmployees.length === 0 ? (
                        <p className="text-gray-400 text-center">Click to select employees</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allowance.includedEmployees.map((employee) => (
                            <EmployeeChip
                              key={employee.id}
                              employee={employee}
                              onRemove={handleRemoveIncludedEmployee}
                              bgColor="bg-blue-100"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.includedEmployees && (
              <p className="text-red-500 text-sm mt-1">{errors.includedEmployees}</p>
            )}
                  </div>
                )}
    
                {allowance.includeAll && (
                  <div className="p-4 border rounded-lg mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Employees</label>
                    <div
                      className="min-h-[100px] p-3 border-2 border-dashed rounded-lg cursor-pointer"
                      onClick={() => setIsExcludeListOpen(true)}
                    >
                      {allowance.excludedEmployees.length === 0 ? (
                        <p className="text-gray-400 text-center">Click to exclude employees</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allowance.excludedEmployees.map((employee) => (
                            <EmployeeChip
                              key={employee.id}
                              employee={employee}
                              onRemove={handleRemoveExcludedEmployee}
                              bgColor="bg-red-100"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
    
              {/* Save and Cancel Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
    
          {/* Employee Selection Modals */}
          {isIncludeListOpen && (
            <EmployeeSelectionModal
              employees={employees}
              selectedIds={allowance.includedEmployees.map((e) => e.id)}
              onSelect={handleAddIncludedEmployee}
              onClose={() => setIsIncludeListOpen(false)}
              title="Select Employees to Include"
            />
          )}
    
          {isExcludeListOpen && (
            <EmployeeSelectionModal
            
              employees={employees}
              selectedIds={allowance.excludedEmployees.map((e) => e.id)}
              onSelect={handleAddExcludedEmployee}
              onClose={() => setIsExcludeListOpen(false)}
              title="Select Employees to Exclude"
            />
          )}
    
          {/* Toast Notifications */}
          {showToast && (
            <Toast
              type="success"
              title="Allowance Saved Successfully!"
              message="The allowance has been successfully saved."
              duration={3000}
              onClose={() => setShowToast(false)}
            />
          )}
          {error && (
            <Toast
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
        </div>
      );
    };

export default AllowanceModal;