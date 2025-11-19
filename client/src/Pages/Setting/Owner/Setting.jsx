import React, { useState } from "react";
import UserInfo from "./UserInfo/UserInfo";
import CompanyInfo from "./CompanyInfo/CompanyInfo";

function Setting() {
  const [activePage, setActivePage] = useState("Setting");

  const pages = ["Setting", "Company Information"];
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
      {activePage === "Setting" && <UserInfo />}
      {activePage === "Company Information" && <CompanyInfo />}
    </div>
  );
}

export default Setting;
