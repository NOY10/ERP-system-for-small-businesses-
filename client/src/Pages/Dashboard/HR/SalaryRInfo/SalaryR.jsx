import React, { useEffect, useRef, useState, memo } from "react";
import { FaAngleDown } from "react-icons/fa";
import SalaryRGraph from "./SalaryRGraph";
import Tooltip from "../../../../Components/Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

const dropdownOptions = [
  "This Fiscal Year",
  "Previous Fiscal Year",
  "Last 12 Months",
  "Last 6 Months",
];

function SalaryR() {
  const [isOpenCashFlow, setIsOpenCashFlow] = useState(false);
  const [yearDropDown, setYearDropDown] = useState(dropdownOptions[0]);
  const dropdownRefCashFlow = useRef(null);

  const toggleDropdownCashFlow = () => setIsOpenCashFlow((prev) => !prev);

  const closeDropdownCashFlow = (e) => {
    if (
      dropdownRefCashFlow.current &&
      !dropdownRefCashFlow.current.contains(e.target)
    ) {
      setIsOpenCashFlow(false);
    }
  };

  const handleSelectionCashFlow = (name) => {
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
      {/* <div className="flex items-center p-2 border-b bg-white rounded-t-lg">
          <Tooltip
            title="Cash Flow"
            tooltip="Amount of money moving in and out of your business"
          />
          <div className="relative inline-block" ref={dropdownRefCashFlow}>
            <div
              className="flex items-center bg-white px-2 py-1 rounded focus:outline-none cursor-pointer"
              onClick={toggleDropdownCashFlow}
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
                  onClick={() => handleSelectionCashFlow(option)}
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
            Salary Report
          </h4>
          <Tooltip
            tooltip="Visualizes salary trends over the fiscal year"
            position="bottom"
          >
            <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
          </Tooltip>
        </div>

        <div className="relative inline-block" ref={dropdownRefCashFlow}>
          <div
            className="flex items-center bg-white px-2 py-1 rounded focus:outline-none cursor-pointer"
            onClick={toggleDropdownCashFlow}
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
                onClick={() => handleSelectionCashFlow(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-2">
        <SalaryRGraph yearDropDown={yearDropDown} />
      </div>
    </div>
  );
}

export default memo(SalaryR);
