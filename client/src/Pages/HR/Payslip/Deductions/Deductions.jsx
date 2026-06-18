import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaListOl, FaPlusCircle } from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import Toast from "../../../../Components/Toast";
import useAuthStore from "../../../../store/useAuthStore";
import CardItem from "../Deductions/CardItem";
import DataTable from "../Deductions/DataTable";
import { API_BASE_URL } from "../../../../config/api";

import DeductionModal from "./DeductionModal"; // Updated import

const pastelColors = [
  '#f07167', '#335c67', '#7f5539', '#f28482', '#f5cac3',
  '#6b705c', '#cb997e', '#9d6b53', '#c9cba3', '#eae0d5',
  '#b392ac', '#735d78', '#e27396', '#f29559', '#acd8aa'
];

const getRandomColor = ((colors) => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      colorMap.set(id, colors[Math.floor(Math.random() * colors.length)]);
    }
    return colorMap.get(id);
  };
})(pastelColors);

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const columns = [
  { field: "name", headerName: "Deduction", flex: 1 }, // Updated header
  { field: "defaultAmount", headerName: "Amount", flex: 1 }, // Updated field name
  { field: "createdAt", headerName: "Date Created", flex: 1 },
];

const Deductions = () => {
  const [view, setView] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState(null); // Updated state
  const [deductions, setDeductions] = useState([]); // Updated state
  const [toast, setToast] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchDeductions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllDeductionTypes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setDeductions(data.deductionTypes); // Updated state
        }
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to fetch deductions' }); // Updated message
      }
    };
    fetchDeductions();
  }, [token]);

  const handleSave = async (deductionData) => {
    try {
      const url = editingDeduction
        ? `${API_BASE_URL}/editDeductionType/${editingDeduction._id}` // Updated endpoint
        : `${API_BASE_URL}/addDeductionType`; // Updated endpoint

      const method = editingDeduction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deductionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save deduction'); // Updated message
      }

      const data = await response.json();

      // Use correct property based on create/edit operation
      const resultDeduction = editingDeduction
        ? data.updatedDeductionType // Updated property
        : data.deductionType; // Updated property

      setDeductions(prev => editingDeduction
        ? prev.map(d => d._id === resultDeduction._id ? resultDeduction : d) // Updated state
        : [...prev, resultDeduction]
      );

      setToast({
        type: 'success',
        message: `Deduction ${editingDeduction ? 'updated' : 'created'} successfully` // Updated message
      });

    } catch (error) {
      console.error('Error:', error);
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteDeductionType/${id}`, { // Updated endpoint
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete deduction'); // Updated message

      setDeductions(prev => prev.filter(d => d._id !== id)); // Updated state
      setToast({ type: 'success', message: 'Deduction deleted successfully' }); // Updated message
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const filteredDeductions = deductions.filter(deduction =>
    deduction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Deductions</h1> {/* Updated title */}
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
              setEditingDeduction(null); // Updated state
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
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {view === "card" ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredDeductions.map(deduction => { // Updated state
            const color = getRandomColor(deduction._id);
            return (
              <CardItem
                key={deduction._id}
                item={{
                  ...deduction,
                  title: deduction.name,
                  amount: deduction.defaultAmount, // Updated field
                  date: new Date(deduction.createdAt).toLocaleDateString(),
                  initials: getInitials(deduction.name),
                }}
                color={color}
                onEdit={() => {
                  setEditingDeduction(deduction); // Updated state
                  console.log("Editing Deduction:", deduction); // Updated log
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(deduction._id)}
              />
            );
          })}
        </div>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <DataTable
            columns={columns}
            rows={filteredDeductions.map(d => ({ // Updated state
              ...d,
              createdAt: new Date(d.createdAt).toLocaleDateString(),
            }))}
            onEdit={(deduction) => { // Updated state
              setEditingDeduction(deduction);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
        </table>
      )}

      {showModal && (
        <DeductionModal // Updated component
          onClose={() => {
            setShowModal(false);
            setEditingDeduction(null); // Updated state
          }}
          onSave={handleSave}
          editingDeduction={editingDeduction} // Updated prop
        />
      )}
    </div>
  );
};

export default Deductions;