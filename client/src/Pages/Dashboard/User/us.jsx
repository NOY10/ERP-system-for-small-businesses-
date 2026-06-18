import React, { useState } from "react";
import AccDashboard from "../Accountant/AccDashboard";
import HrDashboard from "../HR/HrDashboard";

function OwnerDashboard() {
  const [activePage, setActivePage] = useState("ACC Dashboard");

  const pages = ["ACC Dashboard", "HR Dashboard"];
  return (
    <div>
      <header className="flex justify-between items-center py-4 ">
        <div className="flex items-center space-x-6 text-gray-800 text-sm font-medium">
          {pages.map((page) => (
            <span
              key={page}
              onClick={() => setActivePage(page)}
              className={`cursor-pointer ${
                activePage === page
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "hover:text-blue-600"
              }`}
            >
              {page}
            </span>
          ))}
        </div>
      </header>
      {/* {activePage === "Default OwnerDashboard" && <OwnerOwnerDashboard />} */}
      {activePage === "HR Dashboard" && <HrDashboard />}
      {activePage === "ACC Dashboard" && <AccDashboard />}
    </div>
  );
}

export default OwnerDashboard;
