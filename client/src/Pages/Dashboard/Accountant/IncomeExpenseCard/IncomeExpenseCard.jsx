import React, { useEffect, useRef, useState, memo } from "react";
import { FaAngleDown } from "react-icons/fa";
import IncomeExpense from "./IncomeExpenseGraph";
import Tooltip from "../../../../Components/Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

const dropdownOptions = [
  "This Fiscal Year",
  "Previous Fiscal Year",
  "Last 12 Months",
  "Last 6 Months",
];

function IncomeExpenseCard() {
  const [isOpenIncomeExpense, setIsOpenIncomeExpense] = useState(false);
  const [yearDropDown, setYearDropDown] = useState(dropdownOptions[0]);
  const dropdownRefIncomeExpense = useRef(null);

  const toggleDropdownIncomeExpense = () =>
    setIsOpenIncomeExpense((prev) => !prev);

  const closeDropdownIncomeExpense = (e) => {
    if (
      dropdownRefIncomeExpense.current &&
      !dropdownRefIncomeExpense.current.contains(e.target)
    ) {
      setIsOpenIncomeExpense(false);
    }
  };

  const handleSelectionIncomeExpense = (name) => {
    setYearDropDown(name);
    setIsOpenIncomeExpense(false);
  };

  useEffect(() => {
    if (isOpenIncomeExpense) {
      document.addEventListener("click", closeDropdownIncomeExpense);
    }
    return () => {
      document.removeEventListener("click", closeDropdownIncomeExpense);
    };
  }, [isOpenIncomeExpense]);

  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      {/* <div className="flex items-center p-2 border-b bg-white rounded-t-lg">


        <div className="relative inline-block" ref={dropdownRefIncomeExpense}>
          <div
            className="flex items-center bg-white px-2 py-1 rounded focus:outline-none cursor-pointer"
            onClick={toggleDropdownIncomeExpense}
          >
            <button className="w-[140px] text-right">{yearDropDown}</button>
            <FaAngleDown className="text-primary" />
          </div>
          <div
            className={`absolute top-full p-2 left-0 mt-2 w-48 bg-white bordershadow-xl rounded-xl z-10 ${
              isOpenIncomeExpense ? "block" : "hidden"
            }`}
          >
            {dropdownOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                onClick={() => handleSelectionIncomeExpense(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="flex items-center justify-between w-full p-4 border-b bg-white rounded-t-lg relative md:p-4 z-10">
        <div className="flex items-center gap-x-1 md:gap-x-2">
          <h4 className="text-base md:text-lg font-medium text-gray-700">
            Income and Expense
          </h4>
          <Tooltip
            tooltip="Displays total sales, receipts, and expenses for the current year"
            position="bottom"
          >
            <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
          </Tooltip>
        </div>
        <div className="relative inline-block" ref={dropdownRefIncomeExpense}>
          <div
            className="flex items-center bg-white px-2 py-1 rounded focus:outline-none cursor-pointer"
            onClick={toggleDropdownIncomeExpense}
          >
            <button className="w-[140px] text-right">{yearDropDown}</button>
            <FaAngleDown className="text-primary" />
          </div>
          <div
            className={`absolute top-full p-2 left-0 mt-2 w-48 bg-white bordershadow-xl rounded-xl z-10 ${
              isOpenIncomeExpense ? "block" : "hidden"
            }`}
          >
            {dropdownOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                onClick={() => handleSelectionIncomeExpense(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-2">
        <IncomeExpense yearDropDown={yearDropDown} />
      </div>
    </div>
  );
}

export default memo(IncomeExpenseCard);
