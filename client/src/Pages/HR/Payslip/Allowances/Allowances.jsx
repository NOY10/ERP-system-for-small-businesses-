import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaListOl, FaPlusCircle } from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import Toast from "../../../../Components/Toast";
import useAuthStore from "../../../../store/useAuthStore";
import CardItem from "../Deductions/CardItem";
import DataTable from "../Deductions/DataTable";
import AllowanceModal from "./AllowanceModal";
import { API_BASE_URL } from "../../../../config/api";

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
  { field: "name", headerName: "Allowance", flex: 1 },
  { field: "defaultAmount", headerName: "Amount", flex: 1 },
  { field: "createdAt", headerName: "Date Created", flex: 1 },
];

const Allowances = () => {
  const [view, setView] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [toast, setToast] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchAllowances = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllAllowanceTypes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setAllowances(data.allowanceTypes);
        }
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to fetch allowances' });
      }
    };
    fetchAllowances();
  }, [token]);

  const handleSave = async (allowanceData) => {
    try {
      const url = editingAllowance
        ? `${API_BASE_URL}/editAllowanceType/${editingAllowance._id}`
        : `${API_BASE_URL}/addAllowanceType`;
  
      const method = editingAllowance ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(allowanceData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save allowance');
      }
  
      const data = await response.json();
  
      // Use correct property based on create/edit operation
      const resultAllowance = editingAllowance 
        ? data.updatedAllowanceType 
        : data.allowanceType;
  
      setAllowances(prev => editingAllowance
        ? prev.map(a => a._id === resultAllowance._id ? resultAllowance : a)
        : [...prev, resultAllowance]
      );
  
      setToast({ 
        type: 'success', 
        message: `Allowance ${editingAllowance ? 'updated' : 'created'} successfully` 
      });
      
      
    } catch (error) {
      console.error('Error:', error);
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deleteAllowanceType/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete allowance');
      
      setAllowances(prev => prev.filter(a => a._id !== id));
      setToast({ type: 'success', message: 'Allowance deleted successfully' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const filteredAllowances = allowances.filter(allowance =>
    allowance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Allowances</h1>
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
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {view === "card" ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredAllowances.map(allowance => {
            const color = getRandomColor(allowance._id);
            return (
              <CardItem
                key={allowance._id}
                item={{
                  ...allowance,
                  title: allowance.name,
                  amount: allowance.defaultAmount,
                  date: new Date(allowance.createdAt).toLocaleDateString(),
                  initials: getInitials(allowance.name),
                }}
                color={color}
                onEdit={() => {
                  setEditingAllowance(allowance);
                  console.log("Editing Allowance:", allowance); 
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(allowance._id)}
              />
            );
          })}
        </div>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <DataTable
            columns={columns}
            rows={filteredAllowances.map(a => ({
              ...a,
              createdAt: new Date(a.createdAt).toLocaleDateString(),
            }))}
            onEdit={(allowance) => {
              setEditingAllowance(allowance);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
        </table>
      )}

{showModal && (
  <AllowanceModal
    onClose={() => {
      setShowModal(false);
      setEditingAllowance(null);
    }}
    onSave={handleSave}
    editingAllowance={editingAllowance} // Ensure this is passed
  />
)}
    </div>
  );
};

export default Allowances;