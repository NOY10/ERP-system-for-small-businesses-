import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { getDocument } from "pdfjs-dist";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import useAuthStore from "../../../store/useAuthStore";
import ExpenseDropdown from "../../../Components/HeaderSubheader";

import { API_BASE_URL } from "../../../config/api";

const NewExpense = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [header, setHeader] = useState("");
  const [subheader, setSubheader] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const { token } = useAuthStore();

  // Clean up file preview URL when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

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

  const validateForm = () => {
    return date && header && subheader && amount && dueDate && notes;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setErrorMessage("Please fill all the fields");
      setTimeout(() => {
        setErrorMessage("");
      }, 2000);
      resetForm();
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const newExpense = {
      header,
      subheader,
      amount: parseFloat(amount),
      description: notes,
      date,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/addExpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) {
        throw new Error("Failed to add the expense");
      }
      setSuccessMessage("Expense Save successfully");
      resetForm();
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/Expense");
      }, 2000);
    } catch (error) {
      setErrorMessage("An error occurred while saving the expense.");
      setTimeout(() => {
        setErrorMessage("");
      }, 2000);
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

  const handledrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const preprocessFile = async (file) => {
    if (file.type === "application/pdf") {
      const pdfData = await file.arrayBuffer();
      const pdf = await getDocument({ data: pdfData }).promise; // Updated import usage
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;

      return canvas.toDataURL("image/png");
    }

    // For image files
    return URL.createObjectURL(file);
  };

  const parseReceiptText = (text) => {
    const dateRegex =
      /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})\b/;
    const amountRegex =
      /\b(?:Total|Amount|Subtotal):?\s*([₹$€£]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b/i;
    const headerRegex = /(Header|Category|Income):?\s*([\w\s]+)/i;
    const paidThroughRegex =
      /(Paid Through|Payment Method):?\s*(Cash|Bank|Credit Card)/i;
    const dueDateRegex =
      /\b(Due Date|Payment Due):?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/;
    const statusRegex = /(Status):?\s*(Paid|Pending)/i;

    return {
      date: text.match(dateRegex)?.[1] || "",
      amount: text.match(amountRegex)?.[1]?.replace(/[^\d.]/g, "") || "",
      header: text.match(headerRegex)?.[2]?.trim() || "",
      paidThrough: text.match(paidThroughRegex)?.[2] || "",
      dueDate: text.match(dueDateRegex)?.[2] || "",
      status: text.match(statusRegex)?.[2] || "",
      notes: text,
    };
  };

  const onBackClick = () => {
    navigate("/Expense");
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-lg max-w-7xl mx-auto">
      <button
        onClick={onBackClick}
        className="flex items-center mb-4 text-blue-500 hover:underline"
      >
        <ArrowBackIcon className="mr-2" /> Back
      </button>

      <h2 className="text-3xl font-bold mb-6 justify-center">Record Expense</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <ExpenseDropdown
              selectedHeader={header}
              selectedSubheader={subheader}
              onHeaderChange={(selectedHeader) => setHeader(selectedHeader)}
              onSubheaderChange={(selectedSubheader) =>
                setSubheader(selectedSubheader)
              }
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2 text-blue-500">
              Amount
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <label className="block font-medium mb-2b text-blue-500 ">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-400 rounded-lg p-8 hover:border-blue-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handledrop}
        >
           {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-100 mx-auto mb-4"></div>
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

      {errorMessage && (
        <div className="mt-4 text-red-500 font-medium">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="mt-4 text-green-500 font-medium">{successMessage}</div>
      )}

      <button
        onClick={handleSubmit}
        className={`mt-8 w-[50rem] bg-blue-500 text-white rounded-lg hover:bg-blue-600 px-6 py-3 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Expense"}
      </button>

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
    </div>
  );
};

export default NewExpense;
