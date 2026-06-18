import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import Toast from "../../../../Components/Toast.jsx";
import useAuthStore from "../../../../store/useAuthStore.jsx";
import DisplayUserInfo from "./DisplayUserInfo.jsx";
import ActionBtn from "./ActionBtn.jsx";
import ProfilePic from "../../ProfilePic.jsx";

import { API_BASE_URL } from "../../../../config/api";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  console.log("res", res);

  const data = await res.json();

  if (res.ok) {
    return data.url;
  } else {
    throw new Error(data.error.message);
  }
};

function UserInfo() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { token, user } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/getOwner/${user.id}`,
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
          setStaff(data.owner);
          // If there's an existing profile image, set it as preview
          if (data.owner.profileImage) {
            setPreviewImage(data.owner.profileImage);
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
  }, [token, navigate, user.id]);

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
        `${API_BASE_URL}/updateOwner/${user.id}`,
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

      setIsEditing(false);
      setShowToast(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/deleteOwner/${user.id}`,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prevStaff) => ({ ...prevStaff, [name]: value }));
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
      <DisplayUserInfo
        staff={staff}
        handleChange={handleChange}
        isEditing={isEditing}
      />

      {/* Action Buttons */}
      <ActionBtn
        setIsEditing={setIsEditing}
        handleDelete={handleDelete}
        handleSave={handleSave}
        isEditing={isEditing}
      />
    </div>
  );
}

export default UserInfo;
