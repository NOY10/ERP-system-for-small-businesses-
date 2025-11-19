// components/FileUploader.js
import React, { useCallback, useState } from "react";

function FileUploader({ onFileSelect, acceptedFormats, maxSizeMB = 25 }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const selectedFile = e.dataTransfer.files[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
          onFileSelect(selectedFile);
        }
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
          setFile(selectedFile);
          onFileSelect(selectedFile);
        }
      }
    },
    [onFileSelect]
  );

  const validateFile = (file) => {
    const validExtensions = acceptedFormats.map((f) => f.toLowerCase());
    const extension = file.name.split(".").pop().toLowerCase();
    const isValidType = validExtensions.includes(extension);
    const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

    if (!isValidType) {
      alert(
        `Invalid file type. Please upload a ${acceptedFormats.join(", ")} file.`
      );
      return false;
    }

    if (!isValidSize) {
      alert(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div>
      {/* File display when selected */}
      {file ? (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium text-gray-700">{file.name}</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drag and drop area (only shown when no file is selected) */
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors 
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              Drag and drop file to import
            </p>
            <p className="text-sm text-gray-500">
              Maximum File Size: {maxSizeMB} MB • File Format:{" "}
              {acceptedFormats.join(", ")}
            </p>

            <label className="mt-4 cursor-pointer">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Choose File
              </span>
              <input
                type="file"
                className="hidden"
                accept={acceptedFormats.map((f) => `.${f}`).join(",")}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
