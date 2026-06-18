import React, { useState } from "react";
import Reconcilemain from "./Reconcile/Reconcilemain";
import BankS from "./BankStatement/BankS";
import AccountT from "./AccountTransaction/AccountT";

const BankLayout = () => {
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full  shadow-lg">
      {/* Tab List */}
      <div className="flex border-y-2 border-gray-300 bg-white ">
        <button
          onClick={() => handleTabChange("1")}
          className={`px-4 py-4  text-lg ${
            activeTab === "1"
              ? "border-b-2 border-blue-500 text-blue-500"
              : " hover:bg-gray-200"
          }`}
        >
          Reconcile
        </button>
        <button
          onClick={() => handleTabChange("2")}
          className={`px-4 py-4 text-lg ${
            activeTab === "2"
              ? "border-b-2 border-blue-500 text-blue-500"
              : " hover:bg-gray-200"
          }`}
        >
          Bank Statement
        </button>
        <button
          onClick={() => handleTabChange("3")}
          className={`px-4 py-4 text-lg ${
            activeTab === "3"
              ? "border-b-2 border-blue-500 text-blue-500"
              : " hover:bg-gray-200"
          }`}
        >
          Account Transaction
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4 p-2">
        {activeTab === "1" && <Reconcilemain />}
        {activeTab === "2" && <BankS />}
        {activeTab === "3" && <AccountT />}
      </div>
    </div>
  );
};

export default BankLayout;
