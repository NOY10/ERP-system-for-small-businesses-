import React, { useState } from "react";
import FileUploader from "../../../../Components/FileUploader";
import { useNavigate } from "react-router-dom";
import { readImportFile } from "../../../../utils/importFileParser";

function ImportJournal() {
  const [previewData, setPreviewData] = useState([]);
  const [activeTab, setActiveTab] = useState("configure");
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  const requiredHeaders = ["Description", "Debit", "Credit"];

  const navigate = useNavigate();

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setValidationError("");

    if (!selectedFile) {
      setPreviewData([]);
      return;
    }

    try {
      const data = await readImportFile(selectedFile);

      // Validate headers
      if (data.length > 0) {
        const headers = Object.keys(data[0]).map((h) => h.toLowerCase());
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          setValidationError(
            `Missing required columns: ${missingHeaders.join(", ")}. ` +
              `Please check your file and try again.`
          );
          setPreviewData([]);
          return;
        }
      }

      setPreviewData(data);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please check the format and try again.");
    }
  };

  const handleNext = () => {
    if (validationError) {
      alert(validationError);
      return;
    }

    if (file && previewData.length > 0) {
      setActiveTab("preview");
    }
  };

  const handleBack = () => {
    setActiveTab("configure");
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      alert("No data to import");
      return;
    }

    // Format the data for the AddManualJournal component
    const formattedData = previewData.map((row) => ({
      description: row.Description || "",
      debit: row.Debit || "0",
      credit: row.Credit || "0",
      header: "",
      subheader: "",
      taxRate: "",
    }));

    console.log("formattedData", formattedData);
    console.log("previewData", previewData);

    navigate("/ManualJournal/Add", {
      state: { importedEntries: formattedData },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 mb-4 bg-white shadow rounded-lg h-[70px]">
        <span className="text-gray-700 font-semibold text-lg">
          Import Manual Journal
        </span>
      </div>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-sm">
        {validationError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{validationError}</p>
          </div>
        )}

        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "configure"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("configure")}
          >
            Configure
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "preview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            disabled={!file || validationError}
          >
            Preview
          </button>
        </div>

        {activeTab === "configure" ? (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Drag and drop file to import
            </h2>

            <FileUploader
              onFileSelect={handleFileSelect}
              acceptedFormats={["csv", "tsv", "xlsx"]}
              maxSizeMB={25}
            />

            <p className="text-sm text-gray-600 mb-6">
              Download a{" "}
              <a
                href="/samples/journalExample.csv"
                className="text-blue-600 hover:underline"
                download
              >
                sample csv file
              </a>{" "}
              or{" "}
              <a
                href="/samples/journalExample.xlsx"
                className="text-blue-600 hover:underline"
                download
              >
                sample xlsx file
              </a>{" "}
              and compare it to your import file to ensure you have the file
              perfect for the import.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Page Tips</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>
                  Your file must contain these columns:{" "}
                  <strong>Description</strong>, <strong>Debit</strong>, and{" "}
                  <strong>Credit</strong>.
                </li>
                <li>
                  You can download the sample xlsx file to get detailed
                  information about the data fields used while importing.
                </li>
                <li>
                  If you have files in other formats, you can convert it to an
                  accepted file format using any online/offline converter.
                </li>
              </ul>
            </div>

            {file && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!!validationError}
                  className={`px-6 py-2 rounded-md ${
                    validationError
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="preview-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">
                Preview Data
              </h2>
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-600">{file?.name}</span>
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Configure
                </button>
              </div>
            </div>

            {previewData.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                          {requiredHeaders.includes(key.toLowerCase()) && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.entries(row).map(([key, value]) => (
                          <td
                            key={key}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              requiredHeaders.includes(key.toLowerCase())
                                ? "font-medium text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {value?.toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data to preview
              </div>
            )}

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Import Data
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ImportJournal;
