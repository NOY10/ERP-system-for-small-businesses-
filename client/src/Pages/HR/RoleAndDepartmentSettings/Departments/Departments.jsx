import React, { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import AddDepartmentForm from "./AddDepartmentForm";
import Toast from "../../../../Components/Toast";
import useAuthStore from "../../../../store/useAuthStore";
import DeptCard from "./DeptCard";

import { API_BASE_URL } from "../../../../config/api";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { token } = useAuthStore();

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
          console.error("Failed to fetch departments:", data.error);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [token]);

  // Function to handle adding a new role
  const handleAddDept = (newDept) => {
    setDepartments((prevDepts) => [...prevDepts, newDept]);
  };

  // Function to handle editing a role
  const handleEditDept = (updatedDept) => {
    setDepartments((prevDepts) =>
      prevDepts.map((dept) =>
        dept._id === updatedDept._id ? updatedDept : dept
      )
    );
  };

  const handleDeleteDept = (deptId) => {
    setDepartments((prevDepts) =>
      prevDepts.filter((dept) => dept._id !== deptId)
    );
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.deptName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Department Management
          </h1>
          <span className="text-gray-500 text-sm">
            ({filteredDepartments.length} departments)
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search departments..."
            className="pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setIsAddingDept(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
          >
            <FaPlusCircle className="text-white text-[1.125rem]" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((deptName, index) => (
          <DeptCard
            key={index}
            dept={deptName}
            index={index}
            onEditDept={handleEditDept}
            handleDeleteDept={handleDeleteDept}
          />
        ))}
      </div>

      <AddDepartmentForm
        isVisible={isAddingDept}
        title="Add New Department"
        onClose={() => setIsAddingDept(false)}
        onAddDept={handleAddDept}
      />
      {showToast && (
        <Toast
          type="success"
          title="Dept Deleted Successfully!"
          message="Dept Deleted Successfully."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Departments;
