import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";
import { IoIosCloseCircleOutline } from "react-icons/io";

import { API_BASE_URL } from "../../../config/api";

const getRandomColor = (() => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      const pastelColors = [
        "#f07167",
        "#335c67",
        "#7f5539",
        "#f28482",
        "#f5cac3",
        "#6b705c",
        "#cb997e",
        "#9d6b53",
        "#c9cba3",
        "#eae0d5",
        "#b392ac",
        "#735d78",
        "#e27396",
        "#f29559",
        "#acd8aa",
      ];
      colorMap.set(
        id,
        pastelColors[Math.floor(Math.random() * pastelColors.length)]
      );
    }
    return colorMap.get(id);
  };
})();

function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { token, user } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/getSingleEmployee/${id}`,
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
          setStaff(data.employee);
        } else {
          console.error("Failed to fetch employee:", data.error);
          navigate("/StaffInfo");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };
    fetchEmployee();
  }, [id, token, navigate]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prevStaff) => ({ ...prevStaff, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/updateEmployee/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(staff),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update employee");
      }
      setIsEditing(false);

      setShowToast(true);
      // setTimeout(() => navigate("/StaffInfo"), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/deleteEmployee/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setShowToast(true);
        setTimeout(() => navigate("/StaffInfo"), 3000);
      } else {
        throw new Error("Failed to delete employee");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!staff) {
    return (
      <div className="text-center text-lg text-gray-500">
        Loading employee data...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto mt-6">
      {showToast && (
        <Toast
          type="success"
          title=" Successfully Done!"
          message="Successfully Done."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Profile Section with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/staffInfo")}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-grow text-center pr-16">Employee Details</h1>
      </div>

      <div className="flex flex-col items-center relative mb-8">
        <div
          className="relative w-32 h-32 rounded-full border-4 border-gray-300 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: getRandomColor(staff.id) }}
        >
          {staff?.profileImage ? (
            <>
              <img
                src={`${staff?.profileImage}?v=${new Date().getTime()}`}
                alt="Profile"
                className={`w-32 h-32 object-cover ${
                  isEditing ? "cursor-default" : "cursor-pointer"
                }`}
                onClick={!isEditing ? () => setShowPreview(true) : undefined}
              />
              {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 ">
                  <div className="relative h-[80%]">
                    <button
                      className="absolute -top-[30px] right-[5px] text-white text-2xl"
                      onClick={() => setShowPreview(false)}
                    >
                      <IoIosCloseCircleOutline className="text-3xl" />
                    </button>
                    <img
                      src={staff?.profileImage}
                      alt="Full Screen"
                      className="max-w-full max-h-full rounded"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="font-bold text-white text-2xl uppercase">
              {getInitials(staff.name)}
            </span>
          )}
        </div>
        <h2 className="text-2xl mt-3 font-semibold">{staff.name}</h2>
        <p className="text-blue-600 font-medium">{staff.role}{staff.subRole ? ` - ${staff.subRole}` : ''}</p>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 gap-8">
        {/* Personal Information */}
        <section>
          <h3 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "name",
              "email",
              "gender",
              "cid",
              "phone",
              "dob",
              "pan"
            ].map((field) => (
              <div
                key={field}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
              >
                <label className="block text-gray-600 font-semibold capitalize">
                  {field === "cid" 
                    ? "CID" 
                    : field === "dob" 
                    ? "Date of Birth"
                    : field === "pan"
                    ? "Income Tax Number (PAN)"
                    : field.replace("_", " ")}
                </label>

                {isEditing ? (
                  field === "gender" ? (
                    <select
                      name="gender"
                      value={staff[field] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : field === "dob" ? (
                    <TextField
                      fullWidth
                      name="dob"
                      type="date"
                      value={
                        staff[field]
                          ? new Date(staff[field]).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                      margin="dense"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      name={field}
                      value={staff[field] || ""}
                      onChange={handleChange}
                      margin="dense"
                    />
                  )
                ) : (
                  // Handling Display Mode
                  <p className="text-gray-800 text-lg mt-1">
                    {field === "dob" && staff[field]
                      ? new Date(staff[field]).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : staff[field] || "-"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Professional Information */}
        <section>
          <h3 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "department",
              "salary",
              "role",
              "subRole",
            ].map((field) => (
              <div
                key={field}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
              >
                <label className="block text-gray-600 font-semibold capitalize">
                  {field.replace("_", " ")}
                </label>

                {isEditing ? (
                  field === "subRole" ? (
                    <select
                      name="subRole"
                      value={staff[field] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                      value={staff[field] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                  ) : field === "role" ? (
                    <select
                      name="role"
                      value={staff[field] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      disabled={!(user.role === "Owner")}
                    >
                      <option value="HR">HR</option>
                      <option value="Accounts">Accountant</option>
                      <option value="Employee">Employee</option>
                    </select>
                  ) : (
                    <TextField
                      fullWidth
                      name={field}
                      value={staff[field] || ""}
                      onChange={handleChange}
                      margin="dense"
                    />
                  )
                ) : (
                  // Handling Display Mode
                  <p className="text-gray-800 text-lg mt-1">
                    {field === "salary" ? `${staff[field] || "-"} Nu.` : (staff[field] || "-")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bank Account Information */}
        <section>
          <h3 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-100">
            Bank Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "bankName", label: "Bank Name" },
              { key: "accountNumber", label: "Account Number" }
            ].map((field) => (
              <div
                key={field.key}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition-colors duration-200"
              >
                <label className="block text-gray-600 font-semibold">
                  {field.label}
                </label>

                {isEditing ? (
                  <TextField
                    fullWidth
                    name={field.key}
                    value={(staff.bankAccount && staff.bankAccount[field.key]) || ""}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setStaff((prevStaff) => ({
                        ...prevStaff,
                        bankAccount: {
                          ...prevStaff.bankAccount,
                          [name]: value
                        }
                      }));
                    }}
                    margin="dense"
                  />
                ) : (
                  <p className="text-gray-800 text-lg mt-1">
                    {(staff.bankAccount && staff.bankAccount[field.key]) || "-"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              startIcon={<FaSave />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            variant="contained"
            color="warning"
            startIcon={<FaEdit />}
          >
            Edit Employee
          </Button>
        )}
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          startIcon={<FaTrash />}
        >
          Delete Employee
        </Button>
      </div>
    </div>
  );
}

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default StaffDetails;
