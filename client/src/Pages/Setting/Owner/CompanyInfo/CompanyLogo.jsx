import React, { useRef } from "react";
import useAuthStore from "../../../../store/useAuthStore";
import { FiCamera, FiImage } from "react-icons/fi"; // Using react-icons for the placeholder

function CompanyLogo({ setProfileImage, setPreviewImage, previewImage }) {
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();

  const handleImageClick = () => {
    fileInputRef.current.click();
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <div className="flex flex-col relative">
        <div
          className={`relative w-[225px] h-[225px] bg-gray-100 rounded-md border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center overflow-hidden`}
          onClick={handleImageClick}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Company Logo Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FiImage className="w-16 h-16 mb-2" />
              <span className="text-sm font-medium">Upload Company Logo</span>
              <span className="text-xs mt-1">Recommended: 225x225px</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center text-white font-medium">
              <FiCamera className="mr-2" />
              {previewImage ? "Change Photo" : "Upload Photo"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompanyLogo;
