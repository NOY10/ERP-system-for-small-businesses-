import React, { useState, useEffect } from "react";
import AccountTable from "./AccountTable";
import useAuthStore from "../../../../store/useAuthStore";

import { API_BASE_URL } from "../../../../config/api";

const AllAccounts = () => {
  const [accounts, setAccounts] = useState([]);
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
          setAccounts(result.accounts);
        } else {
          const errorData = await response.json();
          console.error(errorData.error || "Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const handleDelete = (updatedRows) => {
    setAccounts(updatedRows);
    console.log("Accounts after deletion:", updatedRows);
  };

  return (
    <AccountTable
      rows={accounts}
      title="All Accounts"
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

export default AllAccounts;
