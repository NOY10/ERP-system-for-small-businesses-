import React, { useState, useEffect } from "react";
import AccountTable from "./AccountTable";
import useAuthStore from "../../../../store/useAuthStore";

import { API_BASE_URL } from "../../../../config/api";

const AssetsAccount = () => {
  const [accounts, setAccounts] = useState([]); // Holds filtered accounts
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllAccounts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();

          // Filter accounts for types 'Current Asset' and 'Non-current Asset'
          const filteredAccounts = result.accounts.filter(
            (account) =>
              account.type === "Current Asset" ||
              account.type === "Non-current Asset"
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
  }, [token]); // Dependency ensures it refetches if the token changes

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

export default AssetsAccount;
