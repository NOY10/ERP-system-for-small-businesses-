import { useEffect, useState } from "react";
import { AiOutlineNumber } from "react-icons/ai";
import { IoPersonAddOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import NewLineTable from "../../../Components/NewLineTable";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";
import { API_BASE_URL } from "../../../config/api";

// import "./invoice.css";

export default function EditQuatation() {
  const navigate = useNavigate();
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { state } = useLocation();
  const [invoiceData, setInvoiceData] = useState(state?.row || {});
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [tableData, setTableData] = useState(invoiceData.quotationItems || []);

  console.log("data" + invoiceData);

  const headers = [
    { label: "Item", field: "item" },
    { label: "Quantity", field: "qty", type: "number" },
    { label: "Unit Price", field: "unitPrice", type: "number" },
    { label: "Amount", field: "amount", type: "text" },
    { label: "", action: "delete" },
  ];

  const handleRowsChange = (updatedRows) => {
    // Update each row's amount dynamically based on qty and unitPrice
    const calculatedRows = updatedRows.map((row) => {
      const qty = parseFloat(row.qty) || 0; // Use 0 if qty is undefined or not a number
      const unitPrice = parseFloat(row.unitPrice) || 0; // Use 0 if unitPrice is undefined or not a number

      return {
        ...row,
        amount: (qty * unitPrice).toFixed(2), // Calculate amount and format to 2 decimal places
      };
    });

    setTableData(calculatedRows);
    console.log("Updated Table Data:", calculatedRows);
  };

  // total amount in the end of the table
  const calculateTotal = () => {
    return tableData.reduce((acc, row) => {
      const amount = parseFloat(row.amount) || 0;
      return acc + amount;
    }, 0);
  };

  const { token } = useAuthStore();

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedInvoice = {
        ...invoiceData,
        quotationItems: tableData,
        date: invoiceDate || invoiceData.date,
        dueDate: invoiceDate || invoiceData.dueDate,
      };

      const response = await fetch(
        `${API_BASE_URL}/updateQuotation/${invoiceData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedInvoice),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quotation");
      }

      setShowToast(true);
      setError("");
      setTimeout(() => {
        setShowToast(false);
        navigate("/Quotation");
      }, 2000);
    } catch (error) {
      console.error("Error updating quotation:", error);
      alert("Error updating quotation");
    }
  };

  const [rows, setRows] = useState(
    invoiceData.quotationItems || [
      { description: "", qty: 0, unitPrice: 0, amount: 0 },
    ]
  );

  useEffect(() => {
    if (invoiceData.quotationItems) {
      setRows(invoiceData.quotationItems);
    }
  }, [invoiceData]);

  const HandleDownload = () => {
    const quotationItems = rows.map((row) => ({
      item: row.item,

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

    const PDFData = {
      to: invoiceData?.client,
      title: invoiceData?.name,
      quotationItems,
      amount: total,
      owner: "Phurpa Tshering",
      date: invoiceData.date?.split("T")[0] || "",
      dueDate: dueDate,
    };

    navigate("/QuotationPDF", { state: { PDFData } });
    console.log("QuotationData to reports: ", PDFData);
  };

  return (
    <main className="p-5">
      <div className="flex items-center justify-between p-4 mb-1 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold">Edit Quotation</h2>
        <div className="flex gap-2">
          <button
            onClick={HandleDownload}
            className=" p-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md w-[100px] ml-auto"
          >
            Preview
          </button>
          <button
            onClick={handleUpdate}
            className=" p-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md w-[100px] ml-auto"
          >
            Update
          </button>
        </div>
      </div>
      <section>
        <div className="bg-white p-1 rounded shadow">
          {/* <div className="flex flex-col justify-center"> */}
          <div className="bg-white rounded-lg p-1 flex flex-col justify-center">
            <article>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="border p-2 pl-10 rounded w-full"
                      defaultValue={invoiceData?.client}
                      onChange={(e) =>
                        setInvoiceData({ ...invoiceData, to: e.target.value })
                      }
                      // onChange={(e) => setClientName(e.target.value)}
                      placeholder="Recipient"
                    />
                    <IoPersonAddOutline className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="border p-2 rounded w-full"
                    defaultValue={invoiceData.date?.split("T")[0] || ""}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="border p-2 rounded w-full"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quotation Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name=""
                      className="border p-2 pl-10 rounded w-full"
                      defaultValue={invoiceData?.name}
                      onChange={(e) =>
                        setInvoiceData({
                          ...invoiceData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Invoice #"
                    />
                    <AiOutlineNumber className="absolute top-5 left-3 transform -translate-y-1/2 text-blue-400 text-xl" />
                  </div>
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
            </article>
          </div>
        </div>
      </section>

      {showToast && (
        <Toast
          type="success"
          title="Invoice Updated Successfully!"
          message="Quotation Updated Successfully!"
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && <Toast message={error} />}
    </main>
  );
}
