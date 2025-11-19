import React from "react";

const InstallmentDetails = ({ employee, onClose }) => {
  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    return nameParts
      .map((part) => part[0].toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const totalInstallments = employee.totalInstallments;
  const installmentAmount = employee.amount / totalInstallments;

  const generateInstallments = () => {
    let installments = [];
    let startDate = new Date(employee.startDate);
    for (let i = 0; i < totalInstallments; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      installments.push({
        id: i + 1,
        date: date.toDateString(),
        amount: installmentAmount.toFixed(2),
        status: "Pending",
      });
    }
    return installments;
  };

  const installments = generateInstallments();

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-md w-2/5">
        <button onClick={onClose} className="float-right">
          &times;
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
            {getInitials(employee.name)}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {employee.name} ({employee.id})
            </p>
            <p className="text-gray-500 text-sm">{employee.department}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold mt-4">{employee.loanType}</h2>
        <p>Total Amount: {employee.amount.toFixed(2)}</p>
        <p>Paid Amount: {employee.paidAmount.toFixed(2)}</p>
        <p>
          Balance Amount: {(employee.amount - employee.paidAmount).toFixed(2)}
        </p>

        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">S/N</th>
              <th className="border p-2">One Time Date</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => (
              <tr key={inst.id} className="border">
                <td className="border p-2 text-center">{inst.id}</td>
                <td className="border p-2 text-center">{inst.date}</td>
                <td className="border p-2 text-center">{inst.amount}</td>
                <td className="border p-2 text-center">{inst.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstallmentDetails;
