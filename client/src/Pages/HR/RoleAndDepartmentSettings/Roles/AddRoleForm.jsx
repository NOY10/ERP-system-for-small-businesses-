import React, { useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";
import Toast from "../../../../Components/Toast";
import Dialogbox from "../../../../Components/Dialogbox";

const AddRoleForm = ({
  title,
  isVisible,
  onClose,
  existingRole,
  onAddRole,
  onEditRole,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);

  const [name, setRoleName] = useState(existingRole ? existingRole.name : "");

  useEffect(() => {
    if (existingRole) {
      setRoleName(existingRole.name);
    }
  }, [existingRole, isVisible]);

  const { token, user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const restrictedRoles = ["Human Resource", "Accountant", "HR", "Accounts"];
    if (restrictedRoles.includes(name.trim())) {
      setError("This role is predefined and cannot be entered.");
      return;
    }

    if (!name.trim()) {
      alert("Role name cannot be empty!");
      return;
    }

    const url = existingRole
      ? `http://localhost:8000/updateRole/${existingRole._id}`
      : "http://localhost:8000/addRole";
    const method = existingRole ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);

        if (existingRole) {
          onEditRole({ ...existingRole, name });
        } else {
          onAddRole({ _id: data.newRole._id, name, createdBy: user.role });
        }
        onClose(false);
      } else {
        // Handle specific error messages from the backend
        if (response.status === 400 && data.error === "Role already exists") {
          setError("Error: This role already exists!");
        }
        console.error("Failed to save role:", data.error);
      }
    } catch (error) {
      console.error("Error saving role:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setRoleName("");
  };

  const message = existingRole
    ? "The role has been successfully updated."
    : "The role has been successfully added to the system.";

  return (
    <>
      {showToast && <Toast type="success" message={message} duration={3000} />}
      {error && <Toast type="error" message={error} />}
      <Dialogbox title={title} isVisible={isVisible} onClose={onClose}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Role Name"
            className="p-2 border rounded"
            value={name}
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/\s+/g, " ");
              setRoleName(value);
            }}
            onBlur={() => setRoleName((prev) => prev.trim())} // T
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {existingRole ? "Update Role" : "Add Role"}
          </button>
        </form>
      </Dialogbox>
    </>
  );
};

export default AddRoleForm;
