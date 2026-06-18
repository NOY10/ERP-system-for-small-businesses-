// import { useState } from "react";
// import { AiOutlineNumber } from "react-icons/ai";
// import { IoPersonAddOutline } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import NewLineTable from "../../../Components/NewLineTable";
// import Toast from "../../../Components/Toast";
// import useAuthStore from "../../../store/useAuthStore";
// // import "./invoice.css";

// export default function NewQuotation() {
//   const navigate = useNavigate();
//   const [clientName, setClientName] = useState("");
//   const [quotationNumber, setQuotationNumber] = useState("");
//   const [quotationDate, setQuotationDate] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [error, setError] = useState("");
//   const [showToast, setShowToast] = useState(false);
//   const { token } = useAuthStore();

//   const [tableData, setTableData] = useState([]);

//   const handleRowsChange = (updatedRows) => {
//     const calculatedRows = updatedRows.map((row) => {
//       const qty = parseFloat(row.qty) || 0;
//       const unitPrice = parseFloat(row.unitPrice) || 0;

//       return {
//         ...row,
//         amount: (qty * unitPrice).toFixed(2),
//       };
//     });

//     setTableData(calculatedRows);
//     console.log("Updated Table Data:", calculatedRows);
//   };

//   const headers = [
//     { label: "Item", field: "description" },
//     { label: "Quantity", field: "qty", type: "number" },
//     { label: "Unit Price", field: "unitPrice", type: "number" },
//     { label: "Amount", field: "amount", type: "text" },
//     { label: "", action: "delete" },
//   ];

//   // total amount in the end of the table
//   const calculateTotal = () => {
//     return tableData.reduce(
//       (total, row) =>
//         total + parseFloat(row.qty || 0) * parseFloat(row.unitPrice || 0),
//       0
//     );
//   };

//   // total amount in the end of the table

//   const handleSave = async () => {
//     const quotationItems = tableData.map((row) => ({
//       item: row.description,

//       amount: (parseFloat(row.unitPrice) || 0) * (parseInt(row.qty, 10) || 1),
//       unitPrice: parseFloat(row.unitPrice) || 0,
//       qty: parseInt(row.qty, 10) || 1,
//     }));

//     // Calculate total
//     let total = 0;
//     console.log("Total Amount:", total);

//     // Calculate total directly using the amount field
//     total = quotationItems.reduce((acc, item) => {
//       return acc + item.amount;
//     }, 0);

//     const invoiceData = {
//       to: clientName,
//       title: quotationNumber,
//       quotationItems,
//       amount: total,
//       owner: "Phurpa Tshering",
//       date: quotationDate,
//     };

//     console.log("Invoice Data:", invoiceData);

//     try {
//       const response = await fetch(`${API_BASE_URL}/addQuotation`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(invoiceData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setShowToast(true);
//         setError("");
//         setTimeout(() => {
//           setShowToast(false);
//           navigate("/Quotation");
//         }, 4000);
//       } else {
//         setError(data.Error || "Error saving invoice.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to save the invoice. Please try again.");
//     }
//   };

//   return (
//     <main className="p-5">
//       <div className="flex items-center justify-between p-4 mb-1 bg-white shadow rounded-lg">
//         <h2 className="text-xl font-semibold">New Quotation</h2>
//         <div className="flex gap-2">
//           {/* <button
//             // onClick={generatePDF}
//             onClick={HandleDownload}
//             className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-transparent hover:text-blue-600 transition duration-300 hover:ring-4 hover:ring-blue-400"
//           >
//             Preview
//           </button> */}
//           <button
//             onClick={handleSave}
//             className=" p-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md w-[100px] ml-auto"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//       <section>
//         <div className="bg-white p-1 rounded shadow">
//           {/* <div className="flex flex-col justify-center"> */}
//           <div className="bg-white rounded-lg p-1 flex flex-col justify-center">
//             <article>
//               <div className="grid grid-cols-3 gap-4 mb-2">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">To</label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       className="border p-2 pl-10 rounded w-full"
//                       value={clientName}
//                       onChange={(e) => setClientName(e.target.value)}
//                       placeholder="Recipient"
//                     />
//                     <IoPersonAddOutline className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Date</label>
//                   <input
//                     type="date"
//                     className="border p-2 rounded w-full"
//                     value={quotationDate}
//                     onChange={(e) => setQuotationDate(e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Due Date
//                   </label>
//                   <input
//                     type="date"
//                     className="border p-2 rounded w-full"
//                     value={dueDate}
//                     onChange={(e) => setDueDate(e.target.value)}
//                   />
//                 </div>
//                 <div className="mt-">
//                   <label className="block text-sm font-medium ">
//                     Quotation Number
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       className="border p-2 pl-10 rounded w-full"
//                       value={quotationNumber}
//                       onChange={(e) => setQuotationNumber(e.target.value)}
//                       placeholder="Quotation#"
//                     />
//                     <AiOutlineNumber className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
//                   </div>
//                 </div>
//               </div>

//               {/* Table */}

//               <NewLineTable headers={headers} onRowsChange={handleRowsChange} />

//               <div className="flex justify-end text-xl font-bold w-full -mt-[30px]">
//                 <span>Total:</span>{" "}
//                 <span>Nu. {calculateTotal().toFixed(2)}</span>
//               </div>
//             </article>
//           </div>
//         </div>
//       </section>

//       {showToast && (
//         <Toast
//           type="success"
//           title="Invoice Added Successfully!"
//           message="The Quotation was added to your Invoice Table."
//           duration={1000}
//           onClose={() => setShowToast(false)}
//         />
//       )}
//       {error && <Toast message={error} />}
//     </main>
//   );
// }

import { useEffect, useState } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { IoPersonAddOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";
// import "./invoice.css";
import NewLineTable from "../../../Components/NewLineTable";
import "./invoice.css";
import useCompanyStore from "../../../store/useCompanyStore";

import { API_BASE_URL } from "../../../config/api";

export default function NewQuotation() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { token } = useAuthStore();
  const { companyInfo } = useCompanyStore();

  const [tableData, setTableData] = useState([]);
  const [files, setFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.importedEntries) {
      setTableData(location.state.importedEntries);
    }
  }, [location.state]);

  // console.log("tableData", tableData);

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  // Handle file deletion
  const deleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const toggleFileUpload = () => {
    setShowFileUpload((prev) => !prev);
  };

  const handleRowsChange = (updatedRows) => {
    // Update each row's amount dynamically based on qty and unitPrice
    const calculatedRows = updatedRows.map((row) => {
      const qty = parseFloat(row.qty) || 0;
      const unitPrice = parseFloat(row.unitPrice) || 0;

      return {
        ...row,
        amount: (qty * unitPrice).toFixed(2),
      };
    });

    setTableData(calculatedRows);
    console.log("Updated Table Data:", calculatedRows);
  };

  const headers = [
    { label: "Item", field: "description" },
    { label: "Quantity", field: "qty", type: "number" },
    { label: "Unit Price", field: "unitPrice", type: "number" },
    { label: "Amount", field: "amount", type: "text" },
    { label: "", action: "delete" },
  ];

  // total amount in the end of the table
  const calculateTotal = () => {
    return tableData.reduce(
      (total, row) =>
        total + parseFloat(row.qty || 0) * parseFloat(row.unitPrice || 0),
      0
    );
  };

  const handleSave = async () => {
    const quotationItems = tableData.map((row) => ({
      item: row.description,

      amount: (parseFloat(row.unitPrice) || 0) * (parseInt(row.qty, 10) || 1),
      unitPrice: parseFloat(row.unitPrice) || 0,
      qty: parseInt(row.qty, 10) || 1,
    }));

    // Calculate total
    let total = 0;
    console.log("Total Amount:", total);

    // Calculate total directly using the amount field
    total = quotationItems.reduce((acc, item) => {
      return acc + item.amount;
    }, 0);

    const invoiceData = {
      to: clientName,
      title: quotationNumber,
      quotationItems,
      amount: total,
      owner: "Phurpa Tshering",
      date: quotationDate,
    };

    console.log("Invoice Data:", invoiceData);

    try {
      const response = await fetch(`${API_BASE_URL}/addQuotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        setError("");
        setTimeout(() => {
          setShowToast(false);
          navigate("/Quotation");
        }, 4000);
      } else {
        setError(data.Error || "Error saving invoice.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save the invoice. Please try again.");
    }
  };

  return (
    <main className="p-5">
      <div className="flex items-center justify-between px-4 bg-white shadow rounded-lg h-[70px] mb-4">
        <span className="text-gray-700 font-semibold text-lg">
          New Quotation
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className=" p-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md w-[100px] ml-auto"
          >
            Save
          </button>
        </div>
      </div>
      <section>
        <div className="bg-white p-1 rounded shadow">
          {/* <div className="flex flex-col justify-center"> */}
          <div className="bg-white rounded-lg p-1 flex flex-col justify-center">
            <article>
              <div className="w-full mx-auto bg-white shadow-sm rounded-lg p-4  ">
                {/* <h2 className="text-2xl font-bold text-blue-500 mb-6 text-center">
                  Customer & Company Information
                </h2> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Customer Details */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Customer Details
                    </h3>
                    <div className="space-y-1">
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Customer Name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                          />
                          <IoPersonAddOutline className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
                        </div>
                      </div>

                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Address
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Customer Address"
                        />
                      </div>
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Customer Email"
                        />
                      </div>
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Phone
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Customer Number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Company Details
                    </h3>
                    <div className="space-y-1">
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Company Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={companyInfo.name}
                          disabled
                        />
                      </div>
                      {/* <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Address
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select address</option>
                        </select>
                      </div> */}
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Email
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={companyInfo.email}
                          disabled
                        />
                      </div>
                      {/* <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Phone
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Phone Number"
                        />
                      </div> */}
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={companyInfo.bankName}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block  text-blue-500 font-medium text-sm">
                          Account Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={companyInfo.accountNo}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" shadow-sm rounded-lg mt-4 p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Quotation Details
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="block font-medium text-sm mb-1">
                      Quotation Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="border p-2 pl-10 rounded w-full"
                        value={quotationNumber}
                        onChange={(e) => setQuotationNumber(e.target.value)}
                        placeholder="Quotation #"
                      />
                      <AiOutlineNumber className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-sm mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block  font-medium text-sm mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="border p-2 rounded w-full"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  {/* <div className="mt-">
                  <label className="block font-medium text-sm ">
                    Invoice Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="border p-2 pl-10 rounded w-full"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Invoice #"
                    />
                    <AiOutlineNumber className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
                  </div>
                </div> */}
                </div>
              </div>

              {/* Table */}

              <NewLineTable
                headers={headers}
                onRowsChange={handleRowsChange}
                initialRows={tableData}
              />

              <div className="flex justify-end text-xl font-bold w-full -mt-[30px]">
                <span>Total:</span>{" "}
                <span>Nu. {calculateTotal().toFixed(2)}</span>
              </div>

              {/* File Upload Section */}

              {showFileUpload && (
                <div className="flex justify-center items-center w-3/4">
                  <div className="border border-dashed border-gray-400 rounded-md p-4 text-center bg-gray-50 w-1/2">
                    <p className="text-gray-500 mb-4">
                      Drag and drop files or select manually
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded"
                    >
                      Upload files
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />

                    {/* File list */}
                    <div className="mt-4">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center mb-2"
                        >
                          <span className="text-gray-700">{file.name}</span>
                          <button
                            onClick={() => deleteFile(index)}
                            className="text-red-500 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Error Message */}
                    <div className="text-red-500 mt-4 flex items-center">
                      <span className="mr-2">⚠️</span>
                      <span>
                        Add a contact and save before attaching a file
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>

      {showToast && (
        <Toast
          type="success"
          title="Quotation Added Successfully!"
          message="The Quotation was added to your Quotation Table."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && <Toast message={error} />}
    </main>
  );
}
