import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

function EmployeeDeptChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex flex-col space-y-6 mt-16 items-center">
        <div className="flex space-x-4 items-end">
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-44 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-48 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-28 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-40 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-48 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-24 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-28 w-8 rounded"></div>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="bg-gray-300 h-48 w-8 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  // Extract department names from depts
  const deptNames = data[0].map((d) => d.deptName);

  // Count employees in each department
  const employeeCountByDept = deptNames.map((dept) => ({
    department: dept,
    employees: data[1].filter((emp) => emp.department === dept).length,
  }));

  // console.log("Processed Data for Chart:", employeeCountByDept);

  return (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: employeeCountByDept.map((d) => d.department),
        },
      ]}
      series={[
        {
          data: employeeCountByDept.map((d) => d.employees),
          label: "Employees",
        },
      ]}
      slotProps={{ legend: { hidden: true } }}
      height={280}
    />
  );
}

export default EmployeeDeptChart;
