import React, { useState } from "react";
import AccountTable from "./AccountTable";
import IncomeAccount from "./IncomeAccount";
import ExpenseAccount from "./ExpenseAccount";
import EquityAccount from "./EquityAccount";
import LiabilitiesAccount from "./LiabilitiesAccount";
import AssetsAccount from "./AssetsAccount";
import AllAccounts from "./AllAccounts";
import AddAccountForm from "./AddAccount";
import DialogBox from "../../../../Components/Dialogbox";
import { FaPlusCircle } from "react-icons/fa";

const ChartsOfAccount = () => {
  const [activeTab, setActiveTab] = useState("All Accounts");
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const renderComponent = () => {
    switch (activeTab) {
      case "All Accounts":
        return <AllAccounts />;
      case "Assets":
        return <AssetsAccount />;
      case "Liabilities":
        return <LiabilitiesAccount />;
      case "Equity":
        return <EquityAccount />;
      case "Expenses":
        return <ExpenseAccount />;
      case "Income":
        return <IncomeAccount />;
      default:
        return <AccountTable />;
    }
  };

  const handleAddAccount = () => {
    setIsAddingAccount(true);
  };

  // Function to close the Add Account form
  const closeAddAccountForm = () => {
    setIsAddingAccount(false);
  };

  return (
    <div className="p-6">
      {/* Top Buttons */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={handleAddAccount} // Open the Add Account form
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
        >
          <FaPlusCircle className="text-white text-[1.125rem]" />
          <span> Add Account</span>
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2">
          <FaPlusCircle className="text-white text-[1.125rem]" />
          <span> Add Bank Account</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-4">
        {[
          "All Accounts",
          "Assets",
          "Liabilities",
          "Equity",
          "Expenses",
          "Income",
        ].map((tab) => (
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

      {/* Render the component for the selected tab */}
      <div>{renderComponent()}</div>

      <DialogBox
        title="Add Account"
        discription=""
        isVisible={isAddingAccount}
        onClose={() => setIsAddingAccount(false)}
      >
        <AddAccountForm onAddAccount={closeAddAccountForm} />
      </DialogBox>
    </div>
  );
};

export default ChartsOfAccount;
