import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import ChangePasswordEmp from "../ChangePasswordEmp";
import DialogBox from "../../../Components/Dialogbox";
import Toast from "../../../Components/Toast";
import ProfilePic from "../ProfilePic";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (res.ok) {
    return data.url;
  } else {
    throw new Error(data.error.message);
  }
};

function SettingEmp() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { token, user } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/getSingleEmployee/${user.employeeId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("data", data);
        if (response.ok) {
          setStaff(data.employee);
          if (data.employee.profileImage) {
            setPreviewImage(data.employee.profileImage);
          }
        } else {
          console.error("Failed to fetch employee:", data.error);
          navigate("/setting");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };
    fetchEmployee();
  }, [token, navigate, user.employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prevStaff) => ({ ...prevStaff, [name]: value }));
  };

  const handleSave = async () => {
    try {
      let profileImageUrl = previewImage;
      if (profileImage) {
        try {
          profileImageUrl = await uploadToCloudinary(profileImage);
        } catch (err) {
          console.error("Cloudinary upload failed:", err.message);
          setError(err.message);
          return;
        }
      }

      const updatedStaff = { ...staff, profileImage: profileImageUrl };

      const response = await fetch(
        `http://localhost:8000/updateEmployee/${user.employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedStaff),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update employee");
      }

      useAuthStore.getState().login(
        {
          ...user,
          name: updatedStaff.name, // Update the name
          email: updatedStaff.email,
          profilePic: profileImageUrl, // Update the profile image
        },
        token
      );
      console.log("updatedStaff.profileImageUrl", updatedStaff.profileImageUrl);
      console.log("updatedStaff", profileImageUrl);

      setIsEditing(false);
      setShowToast(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/deleteEmployee/${user.employeeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setShowToast(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        throw new Error("Failed to delete employee");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!staff) {
    return (
      <div className="text-center text-lg text-gray-500">Loading data...</div>
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
      {/* Profile Section */}
      <ProfilePic
        setProfileImage={setProfileImage}
        isEditing={isEditing}
        setPreviewImage={setPreviewImage}
        previewImage={previewImage}
        staff={staff}
      />

      {/* Personal & Employee Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "name",
          "email",
          "gender",
          "cid",
          "phone",
          "dob",
          "department",
          "salary",
          "role",
          "subRole",
        ].map((field) => (
          <div
            key={field}
            className="border rounded-lg p-4 bg-gray-50 relative"
          >
            <label className="block text-gray-600 font-semibold capitalize">
              {field.replace("_", " ")}
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
              ) : field === "role" ||
                field === "subRole" ||
                field === "department" ||
                field === "salary" ? (
                <p className="text-gray-800">{staff[field]}</p> // These fields are uneditable
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
              <p className="text-gray-800">
                {field === "dob" && staff[field]
                  ? new Date(staff[field]).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : staff[field]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <div
          onClick={() => setShowDialog(true)}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
        >
          Change Password
        </div>
        <DialogBox
          title="Change Password"
          isVisible={showDialog}
          onClose={() => setShowDialog(false)}
        >
          <ChangePasswordEmp />
        </DialogBox>

        <div className="mt-6 flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                startIcon={<FaSave />}
              >
                Save
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
              Edit
            </Button>
          )}
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<FaTrash />}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingEmp;
