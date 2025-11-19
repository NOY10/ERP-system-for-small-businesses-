import React, { useState } from "react";
import Roles from "./Roles/Roles";
import Departments from "./Departments/Departments";

const RoleAndDepartmentSettings = () => {
  const [activeTab, setActiveTab] = useState("Roles");

  const renderComponent = () => {
    switch (activeTab) {
      case "Roles":
        return <Roles />;
      case "Departments":
        return <Departments />;
      default:
        return <Roles />;
    }
  };

  return (
    <div className="p-4">
      <div className="border-b border-gray-300 mb-4">
        {["Roles", "Departments"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Render the selected tab component */}
      <div>{renderComponent()}</div>
    </div>
  );
};

export default RoleAndDepartmentSettings;
