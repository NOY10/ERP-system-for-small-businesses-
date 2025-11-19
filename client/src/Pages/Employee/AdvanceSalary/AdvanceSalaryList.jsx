import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaEdit, FaEllipsisV } from "react-icons/fa";

const AdvanceSalaryList = ({
  employees,
  searchQuery,
  setSearchQuery,
  handleEdit,
  handleDelete,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  // Function to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0].toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getColor = (name) => {
    const colors = [
      "bg-blue-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-red-500",
      "bg-lime-400",
    ];
    if (!name) return "bg-gray-400";
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.employee &&
        emp.employee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.id && emp.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle View Installments
  const handleViewInstallments = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex flex-wrap gap-8 p-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp, index) => (
            <div
              key={index}
              className="bg-gray-100 p-4 rounded-md shadow-lg w-[23%] items-center "
            >
              <div className="mt-1 flex justify-end items-center">
                <FaEllipsisV
                  className="text-gray-500 cursor-pointer hover:text-blue-600"
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                />
                {openMenu === index && (
                  <div
                    ref={menuRef}
                    className="absolute bg-white shadow-md rounded-md py-2 w-32 z-16"
                    // onClick={() => setOpenMenu(null)}
                  >
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 w-full text-left"
                      onClick={() => handleEdit(emp)}
                    >
                      <FaEdit className="text-blue-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      className="flex items-center gap-2  px-4 py-2 text-red-500 hover:bg-gray-200 w-full text-left"
                      onClick={() => handleDelete(emp._id)}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 ">
                <div
                  className={`w-20 h-20 ${getColor(
                    emp.employee
                  )} text-white rounded-full text-3xl flex items-center justify-center font-bold`}
                >
                  {getInitials(emp.employee)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{emp.employee}</p>
                  <p className="text-xl">{emp.title}</p>
                  <p>{emp.amount}</p>

                  <p>
                    Installment Period: <span>{emp.totalInstallments}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">Progress</p>
                <div className="relative pt-1">
                  <div
                    className="w-full bg-gray-200 rounded-full"
                    style={{ height: "1vh" }}
                  >
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{
                        width: `${emp.progress}%`,
                        transition: "width 0.3s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <button
                  className="bg-blue-500 w-full rounded-md p-2 mt-3 text-white hover:bg-blue-600"
                  onClick={() => handleViewInstallments(emp)}
                >
                  View Installments
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 w-full">
            No employees found.
          </p>
        )}
      </div>

      {/* Installment Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-1/3 max-h-[87vh] overflow-auto">
            <div className="flex items-center mb-2">
              <span className="w-16 h-16 bg-blue-500 text-white p-2 rounded-full flex items-center justify-center text-2xl font-bold mr-2">
                {getInitials(selectedEmployee.employee)}
              </span>

              <div className="flex flex-col ml-2">
                <h2 className="text-xl font-semibold">
                  {selectedEmployee.employee}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedEmployee.description}
                </p>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-300 mt-2 pt-2">
              <p className="flex flex-col">
                <strong>Total Amount:</strong>
                <span className="text-blue-500">{selectedEmployee.amount}</span>
              </p>
              <p className="flex flex-col">
                <strong>Paid Amount:</strong>
                <span className="text-blue-500">0</span>
              </p>
              <p className="flex flex-col">
                <strong>Balance Amount:</strong>
                <span className="text-blue-500">{selectedEmployee.amount}</span>
              </p>
            </div>

            {/* Installment Table with Fixed Header */}
            <div className="overflow-auto max-h-[55vh] border border-gray-300 rounded-md">
              <table className="w-full border-collapse">
                <thead className="bg-white sticky top-0 z-10 shadow">
                  <tr>
                    <th className="border-b border-gray-300 p-2">S/N</th>
                    <th className="border-b border-gray-300 p-2">
                      One Time Date
                    </th>
                    <th className="border-b border-gray-300 p-2">Amount</th>
                    <th className="border-b border-gray-300 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    { length: selectedEmployee.totalInstallments },
                    (_, i) => {
                      const installmentAmount =
                        selectedEmployee.amount /
                        selectedEmployee.totalInstallments;
                      const installmentDate = new Date();
                      installmentDate.setMonth(installmentDate.getMonth() + i);
                      return (
                        <tr key={i} className="border-b border-gray-300">
                          <td className="p-2 text-center">{i + 1}</td>
                          <td className="p-2 text-center">
                            {installmentDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-2 text-center">
                            {installmentAmount.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-4 py-1 rounded-full text-white text-center ${
                                selectedEmployee.status === "Approved"
                                  ? "bg-green-500"
                                  : selectedEmployee.status === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                            >
                              Pending
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdvanceSalaryList;
