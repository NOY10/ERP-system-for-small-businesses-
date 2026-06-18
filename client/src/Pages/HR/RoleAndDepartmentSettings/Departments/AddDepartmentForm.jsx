import React, { useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";
import Toast from "../../../../Components/Toast";
import Dialogbox from "../../../../Components/Dialogbox";

import { API_BASE_URL } from "../../../../config/api";

const AddDepartmentForm = ({
  title,
  isVisible,
  onClose,
  existingDept,
  onAddDept,
  onEditDept,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);

  const [deptName, setDeptName] = useState(
    existingDept ? existingDept.deptName : ""
  );

  useEffect(() => {
    if (existingDept) {
      setDeptName(existingDept.deptName);
    }
  }, [existingDept, isVisible]);

  const { token, user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deptName.trim()) {
      alert("Dept name cannot be empty!");
      return;
    }

    const url = existingDept
      ? `${API_BASE_URL}/updateDept/${existingDept._id}`
      : `${API_BASE_URL}/addDept`;
    const method = existingDept ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deptName: deptName.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error === "Dept already exists") {
          setError("Error: This Dept already exists!");
        } else {
          setError(`Error: ${data.error || "Something went wrong."}`);
        }
        console.error("Failed to save Dept:", data.error);
        return; // Stop execution on failure
      }

      // Ensure the response contains valid data
      if (!data.newdeptName || !data.newdeptName._id) {
        throw new Error("Invalid response from server");
      }
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      if (existingDept) {
        onEditDept({ ...existingDept, deptName });
      } else {
        onAddDept({
          _id: data.newdeptName._id,
          deptName,
          createdBy: user.role,
        });
      }

      onClose(false);
    } catch (error) {
      console.error("Error saving Dept:", error);
      alert("An unexpected error occurred. Please try again.");
    }

    setDeptName("");
  };

  const AddUpdate = existingDept ? "Updated" : "Added";
  const message = existingDept
    ? "The Department has been successfully updated."
    : "The Department has been successfully added to the system.";

  return (
    <>
      {showToast && (
        <Toast
          type="success"
          title={`Role ${AddUpdate} Successfully!`}
          message={message}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      <Dialogbox title={title} isVisible={isVisible} onClose={onClose}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Department Name"
            className="p-2 border rounded"
            value={deptName}
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/\s+/g, " "); // Replace multiple spaces with a single space
              setDeptName(value);
            }}
            onBlur={() => setDeptName((prev) => prev.trim())} // Trim trailing spaces on blur
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {existingDept ? "Update Department" : "Add Department"}
          </button>
        </form>
      </Dialogbox>
    </>
  );
};

export default AddDepartmentForm;
