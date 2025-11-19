import React from "react";
import EmployeeDeptChart from "./EmployeeDeptChart";
import Tooltip from "../../../../Components/Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

function EmployeeDept({ data }) {
  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
        <h4 className="text-base md:text-lg font-medium text-gray-700">
          Employees Per Department
        </h4>
        <Tooltip
          tooltip="Represents the number of employees in each department"
          position="bottom"
        >
          <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
        </Tooltip>
      </div>
      <EmployeeDeptChart data={data} />
    </div>
  );
}

export default EmployeeDept;
