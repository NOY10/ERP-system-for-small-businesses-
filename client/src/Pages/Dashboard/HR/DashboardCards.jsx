import React, { useEffect, useState } from "react";
import { FaUsers, FaCalendarAlt } from "react-icons/fa";
import { BiMaleFemale } from "react-icons/bi";
import { GrMoney } from "react-icons/gr";

function DashboardCards({ totalEmployee, totalDept, onLeave }) {
  const [cards, setCards] = useState([
    {
      title: "Total Employees",
      value: null,
      icon: <BiMaleFemale />,
      color: "bg-purple-200",
    },
    {
      title: "On Leave",
      value: 0,
      icon: <FaCalendarAlt />,
      color: "bg-green-200",
    },
    {
      title: "Department",
      value: null,
      icon: <FaUsers />,
      color: "bg-red-200",
    },
    {
      title: "Payroll",
      value: 400000,
      icon: <GrMoney />,
      color: "bg-blue-200",
    },
  ]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.title === "Total Employees" && totalEmployee !== undefined) {
          return { ...card, value: totalEmployee };
        }

        if (card.title === "Department" && totalDept !== undefined) {
          return { ...card, value: totalDept };
        }

        if (card.title === "On Leave" && Array.isArray(onLeave)) {
          // Get only approved leaves where today is within startDate and endDate
          const approvedLeaves = onLeave.filter(
            (leave) =>
              leave.status === "Approved" &&
              leave.startDate <= today &&
              leave.endDate >= today
          );

          // Count unique employees on leave
          const uniqueEmployeesOnLeave = new Set(
            approvedLeaves.map((leave) => leave.employee?._id)
          ).size;

          return { ...card, value: uniqueEmployeesOnLeave };
        }

        return card;
      })
    );
  }, [totalEmployee, totalDept, onLeave]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl p-6 flex flex-col items-center shadow-md w-full max-w-[400px] h-28 relative`}
        >
          <div className="absolute top-4 left-8 text-2xl">{card.icon}</div>
          <p className="absolute top-4 left-8 text-sm mt-6">{card.title}</p>
          <p className="absolute bottom-2 right-8 text-3xl font-bold">
            {card.value !== null ? String(card.value).padStart(2, "0") : "..."}
          </p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
