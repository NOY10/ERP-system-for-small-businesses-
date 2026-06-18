import React, { useEffect, useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import useAuthStore from "../../../../store/useAuthStore";
import { Alert, Snackbar } from "@mui/material";

import { API_BASE_URL } from "../../../../config/api";

const AddAccount = ({ onAddAccount, accountDataToEdit }) => {
  console.log("id", accountDataToEdit);
  const [accountData, setAccountData] = useState({
    code: "",
    name: "",
    type: "",
    taxRate: "",
  });

  const [isCodeUnique, setIsCodeUnique] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

  const { token } = useAuthStore();

  useEffect(() => {
    if (accountDataToEdit) {
      setAccountData(accountDataToEdit);
      setSelectedOption(accountDataToEdit.type);
    }
  }, [accountDataToEdit]);

  const handleSelect = (value) => {
    setSelectedOption(value);
    setIsDropdownOpen(false);
    setAccountData((prevData) => ({
      ...prevData,
      type: value,
    }));
  };
  useEffect(() => {
    if (snackbar.open && snackbar.severity === "success") {
      const timer = setTimeout(() => {
        onAddAccount(null); 
      }, 2000); 
  
      return () => clearTimeout(timer);
    }
  }, [snackbar]);
  

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const checkCodeUnique = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getAllAccounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { accounts } = await response.json();
        const existingCodes = accounts.map((account) =>
          account.code.toString()
        );
        return !existingCodes.includes(code.toString());
      } else {
        console.error("Failed to fetch accounts.");
        return false;
      }
    } catch (error) {
      console.error("Error checking code uniqueness:", error);
      return false;
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setAccountData({ ...accountData, [name]: value });

    if (name === "code") {
      const isUnique = await checkCodeUnique(value);
      setIsCodeUnique(isUnique);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { code, name, type, taxRate } = accountData;

    if (!code || !name || !type || !taxRate) {
      alert("All fields are required.");
      return;
    }

    if (!isCodeUnique) {
      alert("The account code must be unique.");
      return;
    }

    try {
      const endpoint = accountDataToEdit
        ? `${API_BASE_URL}/updateAccount/${accountDataToEdit._id}`
        : `${API_BASE_URL}/addAccount`;

      const response = await fetch(endpoint, {
        method: accountDataToEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        const result = await response.json();
        // alert(
        //   accountDataToEdit
        //     ? "Account edited successfully!"
        //     : "Account added successfully!"
        // );
        setAccountData({ code: "", name: "", type: "", taxRate: "" });
        setSnackbar({
          open: true,
       message: accountDataToEdit ? "Account Edited Successfully" : "Account Added Successfully",
          severity: "success",
        });
        //  onAddAccount(null);
      } else {
        const errorData = await response.json();
        // alert(errorData.error || "Failed to save account");

        setSnackbar({
          open: true,
          message: "User Edited Successfully",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving account:", error);
      alert("An error occurred while saving the account");
    }
  };

  return (
    <>
    <div className="w-full flex items-center rounded-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
        <hr className="w-full" />

        {/* Account Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium">
            Account Code
          </label>
          <input
            type="number"
            id="code"
            name="code"
            value={accountData.code}
            onChange={handleInputChange}
            className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter account code"
            required
          />
          {!isCodeUnique && (
            <p className="text-sm text-red-500 mt-2">
              The account code must be unique.
            </p>
          )}
        </div>

        {/* Account Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Account Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={accountData.name}
            onChange={handleInputChange}
            className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter account name"
            required
          />
        </div>

        {/* Account Type */}
        <div className="w-full">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-blue-500"
            >
              Account Type
            </label>
            <div
              className="relative w-full cursor-pointer border border-gray-300 rounded p-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex justify-between items-center text-sm">
                <span>{selectedOption || "Select type"}</span>
                <IoIosArrowDropdown className="text-blue-500 text-2xl" />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-md border border-gray-300 rounded mt-1 max-h-[200px] overflow-y-auto">
                  <div className="font-semibold text-blue-500 px-2 py-1">
                    Assets
                  </div>
                  <div className="ml-4">
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Current Asset")}
                    >
                      <span>Current Asset</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Non-current Asset")}
                    >
                      <span>Non-Current Asset</span>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-500 px-2 py-1">
                    Liabilities
                  </div>
                  <div className="ml-4">
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Current Liability")}
                    >
                      <span>Current Liability</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Non-current Liability")}
                    >
                      <span>Non-Current Liability</span>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-500 px-2 py-1">
                    Equity
                  </div>
                  <div className="ml-4">
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Equity")}
                    >
                      <span>Equity</span>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-500 px-2 py-1">
                    Expenses
                  </div>
                  <div className="ml-4">
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Direct Expense")}
                    >
                      <span>Direct Expense</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Cost of Goods Sold (COGS)")}
                    >
                      <span>Cost of Goods Sold (COGS)</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Operating Expenses")}
                    >
                      <span>Operating Expenses</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Other Expense")}
                    >
                      <span>Other Expense</span>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-500 px-2 py-1">
                    Revenue/Income
                  </div>
                  <div className="ml-4">
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Revenue")}
                    >
                      <span>Revenue</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Sales")}
                    >
                      <span>Sales</span>
                    </div>
                    <div
                      className="px-2 py-1 flex justify-between items-center"
                      onClick={() => handleSelect("Other Income")}
                    >
                      <span>Other Income</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tax Rate */}
        <div>
          <label htmlFor="taxRate" className="block text-sm font-medium">
            Tax Rate
          </label>
          <input
            type="text"
            id="taxRate"
            name="taxRate"
            value={accountData.taxRate}
            onChange={handleInputChange}
            className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tax rate"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => onAddAccount(null)}
            className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {accountDataToEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
    <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%", color:"white", backgroundColor:"#22c55e", "& .MuiAlert-icon": {
            color: "white",
          },}}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAccount;
