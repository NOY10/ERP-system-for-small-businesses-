import { PieChart } from "@mui/x-charts";
import React, { useEffect, useState } from "react";

function TotalEGraph({ data }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) {
      setLoading(true);
      return;
    }

    if (data.length === 0) {
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(false);

    // Count male and female employees
    const genderCount = data.reduce(
      (acc, employee) => {
        if (employee.gender === "Male") acc.male++;
        if (employee.gender === "Female") acc.female++;
        return acc;
      },
      { male: 0, female: 0 }
    );

    setChartData([
      { id: 0, value: genderCount.male, label: "Male" },
      { id: 1, value: genderCount.female, label: "Female" },
    ]);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="relative w-60 h-60 rounded-full bg-gray-200">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-100 rounded-tl-full animate-pulse transform rotate-0 origin-bottom-right"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-200 rounded-tl-full animate-pulse transform rotate-[60deg] origin-bottom-right"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-300 rounded-tl-full animate-pulse transform rotate-[140deg] origin-bottom-right"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-300 rounded-tl-full animate-pulse transform rotate-[220deg] origin-bottom-right"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-200 rounded-tl-full animate-pulse transform rotate-[300deg] origin-bottom-right"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-100 rounded-tl-full animate-pulse transform rotate-[370deg] origin-bottom-right"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <PieChart
        margin={{ top: 15, bottom: 50, left: 10, right: 10 }}
        series={[
          {
            data: chartData,
            cornerRadius: 4,
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
    </div>
  );
}

export default TotalEGraph;
