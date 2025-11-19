// import { PieChart } from "@mui/x-charts";
// import React from "react";

// function LeaveGraph({ leaves = [] }) {
//   if (!leaves || leaves.length < 1) {
//     return (
//       <div className="flex items-center justify-center p-3 ">
//         {/* Outer Donut Shape */}
//         <div className="relative w-[220px] h-[220px] rounded-full bg-gray-200 overflow-hidden">
//           {/* Segments */}
//           <div
//             className="absolute top-0 left-0 w-full h-full bg-gray-300 "
//             style={{ clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)" }}
//           ></div>

//           <div
//             className="absolute top-0 left-0 w-full h-full bg-gray-100 "
//             style={{
//               clipPath: "polygon(50% 50%, 100% 100%, 0% 100%)",
//               transform: "rotate(120deg)",
//             }}
//           ></div>
//           <div
//             className="absolute top-0 left-0 w-full h-full bg-gray-200 "
//             style={{
//               clipPath: "polygon(50% 50%, 0% 100%, 0% 0%)",
//               transform: "rotate(180deg)",
//             }}
//           ></div>

//           {/* Inner Circle (for cutout effect) */}
//           <div className="absolute top-1/2 left-1/2 w-[110px] h-[110px] bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
//         </div>
//       </div>
//     );
//   }

//   const colorPalette = ["#FFB74D", "#66BB6A", "#EF5350"];

//   // Count occurrences of each status
//   const statusCount = leaves.reduce((acc, item) => {
//     acc[item.status] = (acc[item.status] || 0) + 1;
//     return acc;
//   }, {});

//   // Define data dynamically
//   const chartData = [
//     { id: 0, value: statusCount["Pending"] || 0, label: `Pending Leaves` },
//     { id: 1, value: statusCount["Approved"] || 0, label: `Approved Leaves` },
//     { id: 2, value: statusCount["Rejected"] || 0, label: `Rejected Leaves` },
//   ].filter((item) => item.value > 0); // Remove statuses with 0 count

//   const formattedData = chartData.map((item, index) => ({
//     ...item,
//     color: colorPalette[index % colorPalette.length], // Assign colors dynamically
//   }));

//   return (
//     <>
//       <PieChart
//         margin={{ top: 15, bottom: 50, left: 10, right: 10 }}
//         series={[
//           {
//             data: formattedData,
//             cornerRadius: 4,
//             innerRadius: 50,
//             outerRadius: 100,
//           },
//         ]}
//         slotProps={{
//           legend: {
//             direction: "row",
//             position: { vertical: "bottom", horizontal: "middle" },
//             padding: 12,
//             itemMarkWidth: 13,
//             itemMarkHeight: 14,
//             markGap: 6,
//             itemGap: 9,
//           },
//         }}
//         height={280}
//       />
//     </>
//   );
// }

// export default LeaveGraph;

import { PieChart } from "@mui/x-charts";
import React, { useState, useEffect } from "react";

function LeaveGraph({ leaves = [] }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leaves || leaves.length === 0) {
      setChartData([]);
      setLoading(false);
      return;
    }

    // Count occurrences of each status
    const statusCount = leaves.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const colorPalette = ["#FFB74D", "#66BB6A", "#EF5350"];

    // Define chart data dynamically
    const formattedData = [
      { id: 0, value: statusCount["Pending"] || 0, label: "Pending Leaves" },
      { id: 1, value: statusCount["Approved"] || 0, label: "Approved Leaves" },
      { id: 2, value: statusCount["Rejected"] || 0, label: "Rejected Leaves" },
    ]
      .filter((item) => item.value > 0) // Remove statuses with 0 count
      .map((item, index) => ({
        ...item,
        color: colorPalette[index % colorPalette.length],
      }));

    setChartData(formattedData);
    setLoading(false);
  }, [leaves]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3">
        {/* Loading Donut Placeholder */}
        <div className="relative w-[220px] h-[220px] rounded-full bg-gray-200 overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-full bg-gray-300"
            style={{ clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)" }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-gray-100"
            style={{
              clipPath: "polygon(50% 50%, 100% 100%, 0% 100%)",
              transform: "rotate(120deg)",
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-gray-200"
            style={{
              clipPath: "polygon(50% 50%, 0% 100%, 0% 0%)",
              transform: "rotate(180deg)",
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 w-[110px] h-[110px] bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <PieChart
      margin={{ top: 15, bottom: 50, left: 10, right: 10 }}
      series={[
        {
          data: chartData,
          cornerRadius: 4,
          innerRadius: 50,
          outerRadius: 100,
        },
      ]}
      slotProps={{
        legend: {
          direction: "row",
          position: { vertical: "bottom", horizontal: "middle" },
          padding: 12,
          itemMarkWidth: 13,
          itemMarkHeight: 14,
          markGap: 6,
          itemGap: 9,
        },
      }}
      height={280}
    />
  );
}

export default LeaveGraph;
