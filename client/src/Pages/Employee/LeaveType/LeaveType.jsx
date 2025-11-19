
import React, { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import LeaveCardModal from "./LeaveCardModal";
import LeaveCard from "./LeaveCard";
import useAuthStore from "../../../store/useAuthStore";

const LeaveType = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuthStore();

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

      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredAllowances.map((item) => (
          <LeaveCard
            key={item._id}
            item={item}
            onClose={() => setShowModal(false)}
          />
        ))}
      </div>

      {showModal && (
        <LeaveCardModal
          onClose={() => setShowModal(false)}
          // onSave={handleSave}
          editingAllowance={editingAllowance}
        />
      )}
    </div>
  );
};

export default LeaveType;
