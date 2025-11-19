import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

function LeaveTGraph({ data }) {
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
  const leaveNames = data[0].map((t) => t.leaveType);

  const employeeCountByLeaveInfo = leaveNames.map((leave) => ({
    LeaveName: leave,
    employees: data[1].filter((leaveInfo) => leaveInfo.leaveType === leave)
      .length,
  }));

  return (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: employeeCountByLeaveInfo.map((d) => d.LeaveName),
        },
      ]}
      series={[
        {
          data: employeeCountByLeaveInfo.map((d) => d.employees),
          label: "Employees",
        },
      ]}
      slotProps={{ legend: { hidden: true } }}
      height={280}
    />
  );
}

export default LeaveTGraph;
