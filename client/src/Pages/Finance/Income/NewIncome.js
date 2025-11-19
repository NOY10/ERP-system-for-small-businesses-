import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseDropdown from "../../../Components/HeaderSubheader";
import useAuthStore from "../../../store/useAuthStore";

const NewIncome = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [header, setHeader] = useState("");
  const [subheader, setSubheader] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const { token } = useAuthStore();

  const headers = [
    {
      name: "Revenue",
      subheaders: ["Product Sales", "Service Sales"],
    },
    {
      name: "Other Income",
      subheaders: [
        "Investment Income",
        "Rental Income",
        "Miscellaneous Income",
      ],
    },
  ];

  const validateForm = () => {
    // Only require fields that are essential
    return date && header && subheader && amount;
  };

  useEffect(() => {
    // Clean up object URL when component unmounts or file changes
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      const missingFields = [];
      if (!date) missingFields.push("Date");
      if (!header) missingFields.push("Category");
      if (!subheader) missingFields.push("Subcategory");
      if (!amount) missingFields.push("Amount");

      setErrorMessage(
        `Please fill all required fields: ${missingFields.join(", ")}`
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const newIncome = {
      header,
      subheader,
      amount: parseFloat(amount),
      description: notes,
      date,
      dueDate: dueDate || null, // Send null if empty
    };

    try {
      const response = await fetch("http://localhost:8000/addIncome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newIncome),
      });

      if (!response.ok) throw new Error(await response.text());

      setSuccessMessage("Income saved successfully!");
      resetForm();
      setTimeout(() => navigate("/Income"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage(error.message || "Failed to save income");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate("");
    setHeader("");
    setSubheader("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setUploadedFile(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0] || e.dataTransfer?.files[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Create and set preview URL for the file
    if (file.type.includes('image')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      // For PDFs or other file types, clear any existing preview
      setFilePreview(null);
    }
    
    setLoading(true);
    setErrorMessage("");

    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Create FormData for OCR API
      const formData = new FormData();
      formData.append("client_id", "TEST");
      formData.append("recognizer", "auto");  
      formData.append("file", file);

      const response = await fetch("https://ocr.asprise.com/api/v1/receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("OCR processing failed");

      const { receipts } = await response.json();
      const receipt = receipts[0];
      // Set form fields from OCR results
      setDate(receipt.date || today);
      // Set date
setDate(receipt.date ? receipt.date : today);


//       // Extract total amount
let extractedAmount = "0";

// Keywords to look for in descriptions or keys
const keywords = ["total", "net amount", "grand total", "amount payable", "balance due"];

// Case 1: Try from receipt.total
if (receipt.total) {
  extractedAmount = receipt.total.toString();
} 
// Case 2: Try matching keys in receipt object itself (some APIs might give other field names)
else {
  for (const key in receipt) {
    const lowerKey = key.toLowerCase();
    if (keywords.some(keyword => lowerKey.includes(keyword)) && typeof receipt[key] === "number") {
      extractedAmount = receipt[key].toString();
      break;
    }
  }
}

// Case 3: Try searching in items descriptions
if (extractedAmount === "0" && receipt.items && receipt.items.length > 0) {
  const totalItem = receipt.items.find(item => {
    const desc = item.description?.toLowerCase() || "";
    return keywords.some(keyword => desc.includes(keyword));
  });

  if (totalItem) {
    extractedAmount = totalItem.amount?.toString() || "0";
  }
}

console.log("Extracted amount before cleaning:", extractedAmount);

const cleanAmount = extractedAmount?.replace(/[^\d.]/g, "");
setAmount(cleanAmount || "0");

// let extractedAmount = "0";

// // Case 1: total field present
// if (receipt.total) {
//   extractedAmount = receipt.total.toString();
// } 
// // Case 2: try to find "total" in items descriptions
// else if (receipt.items && receipt.items.length > 0) {
//   const totalItem = receipt.items.find(item =>
//     item.description?.toLowerCase().includes("total")
//   );
//   if (totalItem) {
//     extractedAmount = totalItem.amount?.toString() || "0";
//   }
// }

// console.log("Extracted amount before cleaning:", extractedAmount);

// const cleanAmount = extractedAmount?.replace(/[^\d.]/g, "");
// setAmount(cleanAmount || "0");

      


      // Set due date to 30 days from receipt date or today
      const dueDate = new Date(receipt.date || today);
      dueDate.setDate(dueDate.getDate() + 30);
      setDueDate(dueDate.toISOString().split("T")[0]);

      // Build detailed notes
      setNotes(
        `Merchant: ${receipt.merchant_name || "N/A"}\n` 
          // `Date: ${receipt.date || today}\n` +
          // `Items:\n${
          //   receipt.items
          //     ?.map((item) => `- ${item.description}: ${item.amount}`)
          //     .join("\n") || "None"
          // }\n` +
          // `Total: ${receipt.total?.amount || "0"}`
      );
    } catch (error) {
      console.error("OCR Error:", error);
      setErrorMessage(
        "Couldn't extract receipt details. Please enter manually."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e);
  };

  const onBackClick = () => navigate("/Income");

  // Toggle image enlargement
  const toggleImageEnlargement = () => {
    if (filePreview) {
      setIsImageEnlarged(!isImageEnlarged);
    }
  };
  
  // Close enlarged image when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsImageEnlarged(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-lg max-w-7xl mx-auto">
      <button
        onClick={onBackClick}
        className="flex items-center mb-4 text-blue-500 hover:underline"
      >
        <ArrowBackIcon className="mr-2" /> Back
      </button>

      <h2 className="text-3xl font-bold mb-6 text-center">Record Income</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="col-span-2">
            <ExpenseDropdown
              selectedHeader={header}
              selectedSubheader={subheader}
              onHeaderChange={setHeader}
              onSubheaderChange={setSubheader}
              headers={headers}
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this income..."
            />
          </div>
        </div>

        {/* Right Column - Receipt Upload */}
        <div
          className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-blue-600">Processing receipt...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few seconds
              </p>
            </div>
          ) : (
            <label className="block font-bold text-md mb-2">
              Upload or Drag and Drop your Receipts
            </label>
          )}
          <div className="w-full h-48 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center mb-4 hover:border-blue-400 transition-colors overflow-hidden">
            {uploadedFile ? (
              filePreview ? (
                <img 
                  src={filePreview} 
                  alt="Receipt preview" 
                  className="max-h-full max-w-full object-contain cursor-pointer"
                  onClick={toggleImageEnlargement}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <PictureAsPdfIcon className="text-red-500 text-4xl mb-2" />
                  <p className="text-sm text-gray-500 items-center">{uploadedFile.name}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center">
                <UploadFileIcon className="text-blue-500 text-4xl mb-2" />
                <p className="block text-md text-md mb-2 text-blue-600">Drag your file here</p>
              </div>
            )}
          </div>
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            onClick={() => document.querySelector("#fileUploadInput").click()}
          >
            <UploadFileIcon /> Upload
          </button>
          <input
            id="fileUploadInput"
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
          />
          
          {/* Show clickable message when image is available */}
          {filePreview && (
            <p className="text-blue-500 mt-2 text-sm cursor-pointer hover:underline" onClick={toggleImageEnlargement}>
              Click on image to enlarge
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={` w-[50rem]  py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Income"
          )}
        </button>
      </div>

      {/* Enlarged Image Modal */}
      {isImageEnlarged && filePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setIsImageEnlarged(false)}
            >
              <CloseIcon fontSize="large" />
            </button>
            <img 
              src={filePreview} 
              alt="Enlarged receipt" 
              className="max-h-[85vh] max-w-full object-contain" 
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default NewIncome;
