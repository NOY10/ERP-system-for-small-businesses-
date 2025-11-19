import React, { useEffect, useRef, useState, memo } from "react";
import Tooltip from "../../../../Components/Tooltip";
import { FaAngleDown } from "react-icons/fa";
import TopExpenseChart from "./TopExpenseChart";
import { IoMdInformationCircleOutline } from "react-icons/io";

const dropdownOptions = [
  "This Fiscal Year",
  "This Week",
  "This Month",
  "Previous Fiscal Year",
  "Last 6 Months",
  "Last 12 Months",
];

function TopExpense() {
  const [isOpenCashFlow, setIsOpenCashFlow] = useState(false);
  const [yearDropDown, setYearDropDown] = useState("This Fiscal Year");
  const dropdownRefCashFlow = useRef(null);

  const toggleDropdownTopExpense = () => {
    setIsOpenCashFlow((prev) => !prev);
  };

  const closeDropdownCashFlow = (e) => {
    if (
      dropdownRefCashFlow.current &&
      !dropdownRefCashFlow.current.contains(e.target)
    ) {
      setIsOpenCashFlow(false);
    }
  };

  const handleSelectionTopExpense = (name) => {
    setYearDropDown(name);
    setIsOpenCashFlow(false);
  };

  useEffect(() => {
    if (isOpenCashFlow) {
      document.addEventListener("click", closeDropdownCashFlow);
    }
    return () => {
      document.removeEventListener("click", closeDropdownCashFlow);
    };
  }, [isOpenCashFlow]);

  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between w-full p-4 border-b bg-white rounded-t-lg relative md:p-4 z-10">
        <div className="flex items-center gap-x-1 md:gap-x-2">
          <h4 className="text-base md:text-lg font-medium text-gray-700">
            Top Expense
          </h4>
          <Tooltip
            tooltip="Top expenses across various categories for the chosen period"
            position="bottom"
          >
            <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
          </Tooltip>
        </div>
        <div className="relative inline-block" ref={dropdownRefCashFlow}>
          <div
            className="flex items-center px-2 py-1 rounded focus:outline-none cursor-pointer bg-white"
            onClick={toggleDropdownTopExpense}
          >
            <button className="w-[140px] text-right">{yearDropDown}</button>
            <FaAngleDown className="text-primary" />
          </div>
          <div
            className={`absolute top-full p-2 left-0 mt-2 w-48 bg-gray-100 shadow-lg rounded-xl z-10 ${
              isOpenCashFlow ? "block" : "hidden"
            }`}
          >
            {dropdownOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                onClick={() => handleSelectionTopExpense(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2">
        <TopExpenseChart yearDropDown={yearDropDown} />
      </div>
    </div>
  );
}

export default memo(TopExpense);
