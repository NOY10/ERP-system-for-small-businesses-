import React, { useEffect, useState } from "react";
import DateRange from "../DateRange";

export default function TrialBalance() {
  const [filteredList, setFilteredList] = useState([]);
  const [comparisonData, setComparisonData] = useState([]); // Store comparison data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/DateRange.json");
        if (!response.ok) throw new Error("Failed to fetch data.");
        const data = await response.json();
        setDates(data.dates); // Initialize all available dates
        setFilteredList(data.dates); // Default filtered data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleFilteredDataChange = ({ primaryData, comparisonData }) => {
    setFilteredList(primaryData);
    setComparisonData(comparisonData);
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Trial Balance</h1>
      <DateRange
        dates={dates}
        onFilteredDataChange={handleFilteredDataChange}
      />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="mt-4 flex">
        <h2 className="text-lg font-semibold">
          {comparisonData.length > 0 ? "Comparison Data" : "Filtered Data"}
        </h2>
        <div className="mt-4 flex flex-wrap gap-4 w-full">
          {comparisonData.length > 0 ? (
            comparisonData.map(({ period, data }) => (
              <div key={period} className="mt-4 p-4 border rounded-md w-1/3">
                <h3 className="font-bold">{period}</h3>
                {data.length === 0 ? (
                  <p>No data for this period.</p>
                ) : (
                  <div className="list-disc list-inside">
                    {data.map((item, idx) => (
                      <div key={idx}>
                        {item.date} - {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : filteredList.length > 0 ? (
            filteredList.map((item, idx) => (
              <div key={idx} className="mt-4 p-4 border rounded-md w-1/3">
                <div>
                  {item.date} - {item.name}
                </div>
              </div>
            ))
          ) : (
            <p>No data available for the selected range.</p>
          )}
        </div>
      </div>
    </div>
  );
}
