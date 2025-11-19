import React, { useRef, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { IoIosCloseCircleOutline } from "react-icons/io";

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

function ProfilePic({
  setProfileImage,
  isEditing,
  setPreviewImage,
  previewImage,
  staff,
}) {
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const [showPreview, setShowPreview] = useState(false);

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a new File object with the user's ID as the filename
      const renamedFile = new File([file], `${user.id}}`, {
        type: file.type,
        lastModified: file.lastModified,
      });

      setProfileImage(renamedFile);

      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <div className="flex flex-col items-center relative">
        <div
          className={`relative w-32 h-32 rounded-full border-4 ${
            isEditing
              ? "border-blue-500 cursor-pointer hover:border-blue-700"
              : "border-gray-300"
          } flex items-center justify-center overflow-hidden`}
          style={{
            backgroundColor: !previewImage
              ? getRandomColor(staff.id)
              : "transparent",
          }}
          onClick={handleImageClick}
        >
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="Profile"
                className={`w-full h-full object-cover ${
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
          {isEditing && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white font-medium">Change Photo</span>
            </div>
          )}
        </div>
        <h2 className="text-2xl mt-3 font-semibold">{staff.name}</h2>
      </div>
    </>
  );
}

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default ProfilePic;
