import React, { useEffect, useRef, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProgressBarCard from "./ProgressBarCard";
import Tooltip from "../../../Components/Tooltip";

const data = {
  invoices: {
    current: 0.0,
    overdue: 372580.05,
  },
  bills: {
    current: 5836.79,
    overdue: 244012.67,
  },
};

function DashboardCard({ title, amount, tooltip, type }) {
  const [isOpenCashFlow, setIsOpenCashFlow] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Toggles dropdown visibility
  const toggleDropdownCashFlow = () => {
    setIsOpenCashFlow(!isOpenCashFlow);
  };

  // Handles selection and closes dropdown
  const handleSelection = () => {
    setIsOpenCashFlow(false);
  };

  // Closes the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenCashFlow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center border rounded-lg bg-white m-2 md:m-0">
      <div className="flex items-center justify-between w-full h-[50px] px-4 rounded-t-lg bg-[rgb(243,246,244)]">
        <div className="flex items-center">
          <Tooltip title={title} tooltip={tooltip} />
        </div>
        <div ref={dropdownRef} className="relative cursor-pointer">
          <FaPlusCircle
            className="text-primary"
            onClick={toggleDropdownCashFlow}
          />
          {isOpenCashFlow && (
            <div className="absolute top-full p-2 right-[10px] mt-2 w-48 bg-gray-100 shadow-lg rounded-xl z-10">
              <div
                className="px-4 py-2 hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                onClick={() => handleSelection()}
              >
                {type === "receivable" && (
                  <div
                    className="flex items-center gap-4"
                    onClick={() => handleNavigation("/Invoice")}
                  >
                    <FaPlusCircle className="bg-primary rounded-lg border-none text-gray-300" />
                    <p>New Invoice</p>
                  </div>
                )}
                {type === "payable" && (
                  <div
                    className="flex items-center gap-4"
                    onClick={() => handleNavigation("/Invoice")}
                  >
                    <FaPlusCircle className="bg-primary rounded-lg border-none text-gray-300" />
                    <p>New bill</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        {type === "receivable" && (
          <div className="px-4 py-4 border-y">
            <span className="text-sm text-gray-500">
              Total Unpaid Invoices Nu.{data.invoices.overdue}
            </span>
            <ProgressBarCard
              current={data.invoices.current}
              overdue={data.invoices.overdue}
            />
          </div>
        )}
        {type === "payable" && (
          <div className="px-4 py-4 border-y">
            <span className="text-sm text-gray-500">
              Total Unpaid Bills Nu.{data.bills.overdue}
            </span>
            <ProgressBarCard
              current={data.bills.current}
              overdue={data.bills.overdue}
            />
          </div>
        )}
      </div>
      <>
        {type === "receivable" && (
          <div className="w-full flex items-center">
            <div className="flex-1 px-4 py-4 text-center sm:text-left">
              <p className="text-[11px] text-primary">CURRENT</p>
              <p>Nu.{data.invoices.current}</p>
            </div>

            <div className="w-px h-12 bg-gray-300"></div>

            <div className="flex-1 px-4 py-4 text-center sm:text-left">
              <p className="text-[11px] text-red-500">OVERDUE</p>
              <p>Nu.{data.invoices.overdue}</p>
            </div>
          </div>
        )}
        {type === "payable" && (
          <div className="w-full flex items-center">
            <div className="flex-1 px-4 py-4 text-center sm:text-left">
              <p className="text-[11px] text-primary">CURRENT</p>
              <p>Nu.{data.bills.current}</p>
            </div>

            <div className="w-px h-12 bg-gray-300"></div>

            <div className="flex-1 px-4 py-4 text-center sm:text-left">
              <p className="text-[11px] text-red-500">OVERDUE</p>
              <p>Nu.{data.bills.overdue}</p>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

export default DashboardCard;
