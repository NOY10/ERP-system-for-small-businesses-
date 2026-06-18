import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { API_BASE_URL } from "../../../config/api";

const PersonalDetails = ({ formData, handleChange, errors, setFormData }) => {
  const [countryCode, setCountryCode] = useState("975"); // Bhutan default

  const handlePhoneChange = (value, country) => {
    setFormData((prev) => ({
      ...prev,
      phone: `+${country.dialCode}${value.slice(country.dialCode.length)}`,
    }));
    setCountryCode(country.dialCode);
  };

  return (
    <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-6 md:mb-0">
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800 border-b pb-2 border-blue-100">
          Personal Details
        </h2>
        <div className="grid grid-cols-1 gap-5">
          {["name", "email", "gender", "dob", "cid", "pan"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                {field === "cid"
                  ? "CID"
                  : field === "pan"
                  ? "Income Tax Number (PAN)"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
                {["name", "email", "gender", "dob", "cid"].includes(field) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {field === "gender" ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.gender ? "border-red-500" : "border-blue-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <input
                  type={
                    field === "dob"
                      ? "date"
                      : field === "cid"
                      ? "number"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  pattern={field === "cid" ? "\\d{11}" : null}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors[field] ? "border-red-500" : "border-blue-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800`}
                  placeholder={
                    field === "cid"
                      ? "11-digit Citizenship ID"
                      : field === "pan"
                      ? "Enter Income Tax Number"
                      : `Enter your ${field}`
                  }
                />
              )}

              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <PhoneInput
                  country={"bt"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputStyle={{
                    width: "100%",
                    paddingLeft: "56px",
                    height: "48px",
                    borderRadius: "0.5rem",
                    borderColor: errors.phone ? "#ef4444" : "#bfdbfe",
                    backgroundColor: "white",
                  }}
                  buttonStyle={{
                    borderColor: errors.phone ? "#ef4444" : "#bfdbfe",
                    borderRadius: "0.5rem 0 0 0.5rem",
                    backgroundColor: "#eff6ff",
                    padding: "0 8px",
                  }}
                  dropdownStyle={{
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  enableSearch
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfessionalDetails = ({ formData, handleChange, errors, setFormData }) => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllRoles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRoles(data.roles);
        } else {
          console.error("Error fetching roles:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRoles();
  }, [token]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/getAllDepartments`,
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
          setDepartments(data.departments);
        } else {
          console.error("Error fetching departments:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    fetchDepartments();
  }, [token]);

  const handleBankAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [name]: value
      }
    }));
  };

  return (
    <div className="w-full md:w-1/2 pl-0 md:pl-4">
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800 border-b pb-2 border-blue-100">
          Professional Details
        </h2>
        <div className="grid grid-cols-1 gap-5">
          {["department", "subRole", "salary"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {field !== "subRole" && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field === "subRole" ? (
                <select
                  name="subRole"
                  value={formData.subRole || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.role ? "border-red-500" : "border-blue-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800`}
                >
                  {roles.length > 0 ? (
                    <>
                      <option value="">Select a Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No roles available
                    </option>
                  )}
                </select>
              ) : field === "department" ? (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.role ? "border-red-500" : "border-blue-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800`}
                >
                  {departments.length > 0 ? (
                    <>
                      <option value="">Select a Department</option>
                      {departments.map((department) => (
                        <option
                          key={department._id}
                          value={department.deptName}
                        >
                          {department.deptName}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No departments available
                    </option>
                  )}
                </select>
              ) : (
                <input
                  type={field === "salary" ? "number" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors[field] ? "border-red-500" : "border-blue-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800`}
                  placeholder={`Enter ${field}`}
                  min={field === "salary" ? "0" : undefined}
                />
              )}

              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* Bank Account Information Section */}
          <div className="mt-2">
            <h3 className="text-lg font-medium text-blue-700 mb-3">Bank Account Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankAccount?.bankName || ""}
                  onChange={handleBankAccountChange}
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800"
                  placeholder="Enter bank name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bankAccount?.accountNumber || ""}
                  onChange={handleBankAccountChange}
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-800"
                  placeholder="Enter account number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddNewStaff = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    cid: "",
    department: "",
    salary: "",
    role: "Employee",
    subRole: "",
    pan: "",
    bankAccount: {
      accountNumber: "",
      bankName: ""
    }
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cid") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 11) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      "name",
      "email",
      "dob",
      "gender",
      "cid",
      "phone",
      "department",
      "salary",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        formErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // CID validation
    if (
      formData.cid &&
      (formData.cid.length !== 11 || !/^\d+$/.test(formData.cid))
    ) {
      formErrors.cid = "CID must be exactly 11 digits";
      isValid = false;
    }

    // Phone validation
    if (formData.phone && !/^\+\d{8,15}$/.test(formData.phone)) {
      formErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSend = { ...formData };
    if (!dataToSend.subRole) {
      delete dataToSend.subRole;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addEmployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/staffInfo");
        }, 3000);
      } else {
        setError(data.error || "Error adding employee.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save the employee. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl shadow-sm">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/staffInfo")}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ArrowBackIcon className="mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold text-blue-800 text-center flex-grow pr-12">Add New Employee</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
        <PersonalDetails
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          setFormData={setFormData}
        />
        <ProfessionalDetails
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          setFormData={setFormData}
        />
      </form>

      <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
        <button
          type="button"
          className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          onClick={() => navigate("/staffInfo")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl hover:from-blue-700 hover:to-sky-700 transition-colors font-medium shadow-md"
          onClick={handleSubmit}
        >
          Save Employee
        </button>
      </div>

      {showToast && (
        <Toast
          type="success"
          title="Employee Added Successfully!"
          message="The employee was added to the system."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
    </div>
  );
};

export default AddNewStaff;
