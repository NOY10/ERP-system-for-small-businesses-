import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaListOl } from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import LeaveCardModal from "./LeaveCardModal";
import DataTable from "../../Payslip/Deductions/DataTable";
import LeaveCard from "./LeaveCard";
import { Alert, Snackbar } from "@mui/material";
import useAuthStore from "../../../../store/useAuthStore";
const columns = [
  { field: "leaveType", headerName: "LeaveType", flex: 1 },
  { field: "payment", headerName: "Payment", flex: 1 },
  { field: "days", headerName: "Number of Days", flex: 1 },
  { field: "date", headerName: "Date", flex: 1 },
];

const LeaveType = () => {
  const [view, setView] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuthStore();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/getAllLeaveTypes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          const colorClasses = [
            "bg-green-400",
            "bg-yellow-400",
            "bg-red-500",
            "bg-lime-400",
            "bg-blue-400",
          ];

          const updatedLeaveTypes = data.leaveTypes.map((item, index) => ({
            ...item,
            color: colorClasses[index % colorClasses.length], // Assign colors cyclically
            payment: item.payment ? "Paid" : "Unpaid",
          }));

          setAllowances(updatedLeaveTypes);
        } else {
          setError("Failed to fetch leave types");
        }
      } catch (error) {
        setError("Error fetching leave types");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, [token]);

  const handleSave = (newAllowance) => {
    if (!newAllowance.leaveType || !newAllowance.days) {
      // alert("Leave Type and Number of Days are required.");
      return;
    }

    const colorClasses = [
      "bg-green-400",
      "bg-yellow-400",
      "bg-red-500",
      "bg-lime-400",
      "bg-blue-400",
    ];

    if (editingAllowance) {
      setAllowances((prevAllowances) =>
        prevAllowances.map((item) =>
          item._id === editingAllowance._id
            ? {
                ...item,
                ...newAllowance,
                color:
                  item.color ||
                  colorClasses[Math.floor(Math.random() * colorClasses.length)], 
              }
            : item
        )
      );
    } else {
      const newEntry = {
        ...newAllowance,
        _id: newAllowance._id, 
        color: colorClasses[Math.floor(Math.random() * colorClasses.length)],
        payment: newAllowance.payment ? "Paid" : "Unpaid",
      };

      setAllowances((prev) => [...prev, newEntry]);
    }

    setShowModal(false);
    setEditingAllowance(null);
  };
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = (allowance) => {
    setEditingAllowance(allowance);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch("http://localhost:8000/deleteLeaveType", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [id] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete leave type");
      }

      setSnackbar({
        open: true,
        message: "Leave Type Deleted Successfully!",
        severity: "success",
      });
      // Remove the deleted item from the state
      setAllowances((prevAllowances) =>
        prevAllowances.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting leave type:", error);
    }
  };

  const filteredAllowances = allowances.filter((item) =>
    item.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">LeaveType</h1>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            placeholder="Search"
            className="border p-4 pl-10 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingAllowance(null);
              setShowModal(true);
            }}
            className="bg-blue-500 text-white text-lg flex items-center gap-2 p-4 px-6 rounded hover:bg-blue-500"
          >
            <FaPlusCircle className="text-white text-[18px]" />
            <span>Create</span>
          </button>
          <div className="flex border">
            <button
              onClick={() => setView("card")}
              className={`${
                view === "card" ? "bg-orange-400" : "bg-white"
              } text-white p-2 rounded-l flex items-center w-12 justify-center`}
            >
              <IoGridOutline
                className={`${
                  view === "card" ? "text-white" : "text-blue-500"
                } text-[30px]`}
              />
            </button>
            <button
              onClick={() => setView("list")}
              className={`${
                view === "list" ? "bg-orange-400" : "bg-white-500"
              } text-white p-2 rounded-r flex items-center w-12 justify-center`}
            >
              <FaListOl
                className={`${
                  view === "list" ? "text-white" : "text-blue-500"
                } text-[30px]`}
              />
            </button>
          </div>
        </div>
      </div>

      {view === "card" ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredAllowances.map((item) => (
            <LeaveCard
              key={item._id}   
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <DataTable
            columns={columns}
            rows={filteredAllowances}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </table>
      )}

      {showModal && (
        <LeaveCardModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          editingAllowance={editingAllowance}
        />
      )}
      <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              sx={{ zIndex: 9999 }} 
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                sx={{
                  width: "100%",
                  color: "white",
                  backgroundColor: snackbar.severity === "success" ? "#22c55e" : "#ef4444",
                  "& .MuiAlert-icon": {
                    color: "white",
                  },
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
    </div>
  );
};

export default LeaveType;
