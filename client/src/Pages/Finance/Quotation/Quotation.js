import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../../../Components/EnhancedTable";
import Daterange from "./Components/Daterange";
import InvoiceHeader from "./Components/InvoiceHeader";
import useAuthStore from "../../../store/useAuthStore";

const headCells = [
  { id: "name", numeric: true, disablePadding: true, label: "Quotation Name" },

  { id: "amount", numeric: true, disablePadding: false, label: "Amount (Nu)" },
  {
    id: "items",
    numeric: false,
    disablePadding: false,
    label: "Description",
  },
  { id: "date", numeric: true, disablePadding: false, label: "Creation Date" },
];

const Quotation = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [entry, setEntry] = useState([]);

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/getallQuotation", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        if (data && data.quotation) {
          setEntry(data.quotation);
          console.log("Fetched Data:", data);
        } else {
          console.log("No invoice data found.");
        }

        const formattedData = data.quotation.map((quotation) => {
          // Get the first three items
          const items = quotation.quotationItems
            .slice(0, 3)
            .map((item) => item.item)
            .join(", ");

          // If there are more than three items, append "..."
          const displayedItems =
            quotation.quotationItems.length > 3 ? `${items}, ...` : items;
          //  sum of individual amount of the InvoiceItems
          const totalAmount = quotation.quotationItems.reduce(
            (total, item) => total + (parseFloat(item.amount) || 0),
            0
          );

          return {
            id: quotation._id,
            name: quotation.title,
            client: quotation.to,
            owner: quotation.owner,
            date: quotation.date,
            amount: totalAmount,
            items: displayedItems,
            quotationItems: quotation.quotationItems.map((item) => ({
              item: item.item,
              amount: item.amount,
              unitPrice: item.unitPrice,
              qty: item.qty,
            })),
          };
        });

        setRows(formattedData);
        console.log("Formatted Data: ", formattedData);
      } catch (error) {
        console.error("Error fetching invoices: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  useEffect(() => {}, [entry]);

  const handleDeleteQuotations = async (selectedIds) => {
    try {
      const response = await fetch("http://localhost:8000/deleteQuotation", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete Quotation");
      }

      // Remove deleted rows from the local state
      const updatedRows = rows.filter((row) => !selectedIds.includes(row.id));
      setRows(updatedRows);
    } catch (error) {
      console.error("Error deleting Quotation", error);
    }
  };

  // Filter rows based on the selected date range
  const filterRowsByDate = (rows) => {
    if (!startDate || !endDate) return rows;
    return rows.filter((row) => {
      const rowDate = new Date(row.date);
      return rowDate >= startDate && rowDate <= endDate;
    });
  };

  const filteredRows = filterRowsByDate(rows);
  // const handleEdit = (entry) => {
  //   navigate("/EditQuotation", { state: { entry } });
  // };
  const onRowClick = (row) => {
    navigate("/Quotation/editQuotation", { state: { row } }); // navigate to the edit page with the row data
  };

  return (
    <div>
      <div className="bg-gray-100  py-4 rounded-md flex items-center">
        <div className="flex-grow">
          <InvoiceHeader />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col space-y-4 mt-8">
          <div className="animate-pulse space-y-2">
            <div className="bg-gray-300 h-6 w-1/4 rounded"></div>
            <div className="bg-gray-300 h-8 w-full rounded"></div>
            <div className="bg-gray-300 h-6 w-3/4 rounded"></div>
            <div className="bg-gray-300 h-8 w-5/6 rounded"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse rounded-full h-10 w-10 bg-gray-300"></div>
          </div>
        </div>
      ) : (
        <>
          <Daterange
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            visibleRows={filteredRows}
            headCells={headCells}
          />
          <EnhancedTable
            className="rounded-b-none"
            rows={filteredRows}
            headCells={headCells}
            onDelete={handleDeleteQuotations}
            // onEdit={handleEdit}
            onEditBtn={false}
            onRowClick={onRowClick}
          />
        </>
      )}
    </div>
  );
};

export default Quotation;
