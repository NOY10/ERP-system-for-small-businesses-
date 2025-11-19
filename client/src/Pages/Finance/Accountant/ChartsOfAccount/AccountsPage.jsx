import React, { useState } from "react";
import AddAccount from "./AddAccount";
import AccountTable from "./AccountTable";

const AccountsPage = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const rows = [
    {
      code: "100",
      name: "Cash",
      type: "Asset",
      taxRate: "Tax Exempt (0%)",
      ytd: "5,000.00",
    },
    {
      code: "101",
      name: "Inventory",
      type: "Asset",
      taxRate: "Tax Exempt (0%)",
      ytd: "2,000.00",
    },
  ];

  const handleRowClick = (row) => {
    setSelectedAccount(row); // Set selected row data for editing
  };

  return (
    <div>
      <div className="p-6 bg-gray-50 min-h-screen">
        <AccountTable
          rows={rows}
          actions={[{ label: "Delete", onClick: () => console.log("Delete") }]}
          onRowClick={handleRowClick} // Pass handleRowClick as a prop
        />

        {/* Show AddAccount form when a row is selected for editing */}
        {selectedAccount && (
          <AddAccount
            accountData={selectedAccount} // Pass selectedAccount data as props
            onAddAccount={(updatedAccount) => {
              console.log("Updated Account:", updatedAccount);
              // You can update your rows state with the updated account here
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
