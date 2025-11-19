import React, { useState, useEffect } from "react";
import AccountTable from "./AccountTable";
import useAuthStore from "../../../../store/useAuthStore";

const IncomeAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:8000/getAllAccounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();

          // Filter accounts based on Types
          const filteredAccounts = result.accounts.filter(
            (account) =>
              account.type === "Revenue" ||
              account.type === "Sales" ||
              account.type === "Other Income"
          );

          setAccounts(filteredAccounts);
        } else {
          const errorData = await response.json();
          console.error(errorData.error || "Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [token]);

  const handleDelete = (updatedRows) => {
    setAccounts(updatedRows);
    console.log("Accounts after deletion:", updatedRows);
  };

  return (
    <AccountTable
      rows={accounts}
      title="Assets Accounts"
      actions={[
        {
          label: "Delete",
          onClick: () => handleDelete(accounts.filter((row) => row.isSelected)),
          className: "bg-red-500 text-white hover:bg-red-600",
        },
      ]}
    />
  );
};

export default IncomeAccount;
