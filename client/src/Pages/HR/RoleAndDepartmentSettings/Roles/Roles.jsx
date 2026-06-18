import React, { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import AddRoleForm from "./AddRoleForm";
import useAuthStore from "../../../../store/useAuthStore";
import Toast from "../../../../Components/Toast";
import RoleCard from "./RoleCard";

import { API_BASE_URL } from "../../../../config/api";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { token, user } = useAuthStore();

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
          console.error("Failed to fetch roles:", data.error);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, [token]);

  // Function to handle adding a new role
  const handleAddRole = (newRole) => {
    setRoles((prevRoles) => [...prevRoles, newRole]);
  };

  // Function to handle editing a role
  const handleEditRole = (updatedRole) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role._id === updatedRole._id ? updatedRole : role
      )
    );
  };

  // Function to handle deleting a role
  const handleDeleteRole = (roleId) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role._id !== roleId));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Predefined roles (Only for Owner)
  const predefinedRoles =
    user.role === "Owner"
      ? [
          { name: "Human Resource", createdBy: "System" },
          { name: "Accountant", createdBy: "System" },
        ]
      : [];

  // Combine predefined roles with database roles (Avoid duplicates)
  const allRoles = [...predefinedRoles, ...roles].reduce(
    (uniqueRoles, role) => {
      if (role && role.name && !uniqueRoles.some((r) => r.name === role.name)) {
        uniqueRoles.push(role);
      }
      return uniqueRoles;
    },
    []
  );

  // Filter roles based on search query
  const filteredRoles = allRoles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="p-2">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <span className="text-gray-500 text-sm">
            ({filteredRoles.length} roles)
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search roles..."
            className="pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {(user.role === "Owner" || user.role === "HR") && (
            <button
              onClick={() => setIsAddingRole(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
            >
              <FaPlusCircle className="text-white text-[1.125rem]" />
              <span>Add Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role, index) => (
          <RoleCard
            key={index}
            role={role}
            index={index}
            onEditRole={handleEditRole}
            handleDeleteRole={handleDeleteRole}
          />
        ))}
      </div>

      <AddRoleForm
        isVisible={isAddingRole}
        title="Add New Role"
        onClose={() => setIsAddingRole(false)}
        onAddRole={handleAddRole}
      />
      {/* Toast Messages */}
      {showToast && (
        <Toast
          type="success"
          message="Role Deleted Successfully."
          duration={3000}
        />
      )}
    </div>
  );
};

export default Roles;
