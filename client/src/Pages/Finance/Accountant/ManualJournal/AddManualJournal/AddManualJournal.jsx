import React, { useEffect, useRef, useState } from "react";
import DataTable from "../DataTable";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../../../store/useAuthStore";
import { Alert, Snackbar } from "@mui/material";
import { API_BASE_URL } from "../../../../../config/api";

// import { FaAngleDown } from "react-icons/fa";

const accountType = [
  {
    name: "Assets",
    subheaders: ["Current Asset", "Non-current Asset"],
  },
  {
    name: "Liabilities",
    subheaders: ["Current Liability", "Non-current Liability"],
  },
  {
    name: "Expenses",
    subheaders: ["Direct Expense", "Other Expense"],
  },
  {
    name: "Revenue/Income",
    subheaders: ["Revenue", "Sales", "Other Income"],
  },
];

// const dropdownOptions = ["No Tax", "Tax Exclusive", "Tax Inclusive"];

function AddManualJournal() {
  const [tableData, setTableData] = useState([]);
  const [date, setDate] = useState("");
  const [narration, setNarration] = useState("");
  // const [taxDropDown, setTaxDropDown] = useState(dropdownOptions[0]);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const dropdownTaxREF = useRef(null);
  const location = useLocation();
  const { token } = useAuthStore();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });

  useEffect(() => {
    if (location.state?.importedEntries) {
      setTableData(location.state.importedEntries);
    }
  }, [location.state]);


  // console.log("tableData", tableData);

  // const toggleDropdown = () => {
  //   setIsOpenDropDown((prev) => !prev);
  // };

  // const handleSelectionIncomeExpense = (name) => {
  //   setTaxDropDown(name);
  //   setTableData((prevData) =>
  //     prevData.map((row) => ({
  //       ...row,
  //       subtotal: calculateRowSubtotal(
  //         row.debit,
  //         row.credit,
  //         row.taxRate,
  //         name
  //       ),
  //     }))
  //   );
  //   setIsOpenDropDown(false);
  // };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  }

  const closeDropdown = (e) => {
    if (dropdownTaxREF.current && !dropdownTaxREF.current.contains(e.target)) {
      setIsOpenDropDown(false);
    }
  };

  useEffect(() => {
    if (isOpenDropDown) {
      document.addEventListener("click", closeDropdown);
    }
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, [isOpenDropDown]);

  // const calculateRowSubtotal = (debit, credit, taxRate, taxType) => {
  //   const amount = parseFloat(debit || credit || 0);
  //   const tax = (parseFloat(taxRate) || 0) / 100;

  //   if (taxType === "No Tax") return amount;
  //   if (taxType === "Tax Exclusive") return amount * (1 + tax);
  //   if (taxType === "Tax Inclusive") return amount / (1 + tax);
  //   return amount;
  // };

  const calculateTotals = () => {
    const totals = tableData.reduce(
      (acc, row) => {
        const debit = parseFloat(row.debit || 0);
        const credit = parseFloat(row.credit || 0);
        // const taxRate = (parseFloat(row.taxRate) || 0) / 100;

        let adjustedDebit = debit;
        let adjustedCredit = credit;
        let taxDebit = 0;
        let taxCredit = 0;

        // if (taxDropDown === "Tax Exclusive") {
        //   taxDebit = debit * taxRate;
        //   taxCredit = credit * taxRate;
        //   adjustedDebit = debit;
        //   adjustedCredit = credit;
        // } else if (taxDropDown === "Tax Inclusive") {
        //   if (taxRate > 0) {
        //     adjustedDebit = debit / (1 + taxRate);
        //     adjustedCredit = credit / (1 + taxRate);
        //     taxDebit = Math.max(debit - adjustedDebit, 0);
        //     taxCredit = Math.max(credit - adjustedCredit, 0);
        //   }
        // }

        acc.subtotalDebit += adjustedDebit;
        acc.subtotalCredit += adjustedCredit;
        acc.taxTotalDebit += taxDebit;
        acc.taxTotalCredit += taxCredit;

        return acc;
      },
      {
        subtotalDebit: 0,
        subtotalCredit: 0,
        taxTotalDebit: 0,
        taxTotalCredit: 0,
      }
    );

    return {
      ...totals,
      totalDebit: totals.subtotalDebit + totals.taxTotalDebit,
      totalCredit: totals.subtotalCredit + totals.taxTotalCredit,
    };
  };

  const {
    subtotalDebit,
    subtotalCredit,
    // taxTotalDebit,
    // taxTotalCredit,
    totalDebit,
    totalCredit,
  } = calculateTotals();

  const headers = [
    { label: "Description", field: "description", width: "40%" },
    { label: "Account Type", field: "header", width: "27%" },
    { label: "Account", field: "subheader", width: "30%" },
    { label: "Tax Rate", field: "taxRate", type: "number", width: "20%" },
    { label: "Debit", field: "debit", type: "text", width: "20%" },
    { label: "Credit", field: "credit", type: "text", width: "20%" },
    { label: "", action: "delete", width: "30px" },
  ];

  const handleRowsChange = (updatedRows) => {
    setTableData(updatedRows);
  };

  // Helper function to get the parent account type
  const getAccountType = (header) => {
    for (const account of accountType) {
      if (account.subheaders.includes(header)) {
        return account.name; // Returns "Assets", "Liabilities", etc.
      }
    }
    return null; // If mainAccount doesn't match any subheader
  };

  // Classify transactions based on account type and rules
  const classifyTransactions = (tableData) => {
    let income = [];
    let expense = [];

    tableData.forEach((row) => {
      const { debit, credit, header } = row;
      const parentAccount = getAccountType(header);

      console.log("header", header);

      console.log("account", parentAccount);

      // Apply rules based on parent account type
      switch (parentAccount) {
        case "Assets":
          if (debit > 0) {
            expense.push(row); // Asset decrease reflects an expense
          } else if (credit > 0) {
            income.push(row); // Asset increase reflects income
          }
          break;

        case "Liabilities":
          if (credit > 0) {
            income.push(row);
          } else if (debit > 0) {
            expense.push(row); // Liability decrease reflects expense
          }
          break;

        case "Equity":
          if (credit > 0) {
            income.push(row); // Income due to equity increase (e.g., owner contributions)
          } else if (debit > 0) {
            expense.push(row); // Expense due to equity decrease (e.g., dividends)
          }
          break;

        case "Expenses":
          if (debit > 0) {
            expense.push(row); // Expenses are direct expenses
          } else if (credit > 0) {
            income.push(row);
          }
          break;

        case "Revenue/Income":
          if (credit > 0) {
            income.push(row); // Revenue reflects income
          } else if (debit > 0) {
            expense.push(row);
          }
          break;

        default:
          console.warn(`Unhandled mainAccount: ${header}`);
      }
    });

    return { income, expense };
  };

  // Clean the rows by removing unnecessary properties and 0 values for debit/credit
  const cleanData = (data, date) => {
    return data.map((row) => {
      const { debit, credit, header, taxRate, ...rest } = row;

      const parsedDebit = parseFloat(debit) || 0;
      const parsedCredit = parseFloat(credit) || 0;

      // Transform debit or credit to amount based on which is non-zero
      const amount = parsedDebit !== 0 ? parsedDebit : parsedCredit;

      const cleanedRow = {
        ...rest,
        taxRate,
        amount,
        header,
        date,
      };

      return cleanedRow;
    });
  };

  const handleSave = async () => {
    if (!narration) {
      alert("Please select a narration.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (tableData.length === 0) {
      alert("Please add at least one row in the journal entries table.");
      return;
    }

    // Validate each row
    const rowsWithErrors = [];

    tableData.forEach((row, index) => {
      const errors = [];

      // Check required fields
      if (!row.description?.trim()) errors.push("Description");
      if (!row.header?.trim()) errors.push("Account Type");
      if (!row.subheader?.trim()) errors.push("Account");

      // Parse debit and credit values
      const debit = parseFloat(row.debit) || 0;
      const credit = parseFloat(row.credit) || 0;

      // Validate debit/credit rules
      if (debit === 0 && credit === 0) {
        errors.push("Either Debit or Credit must be entered");
      } else if (debit > 0 && credit > 0) {
        errors.push("Cannot have both Debit and Credit");
      }

      if (errors.length > 0) {
        rowsWithErrors.push({
          row: index + 1,
          errors,
        });
      }

      // Normalize the values (set opposite to 0 when one is entered)
      if (debit > 0) {
        row.credit = "0";
      } else if (credit > 0) {
        row.debit = "0";
      }
    });

    if (rowsWithErrors.length > 0) {
      const errorMessage = rowsWithErrors
        .map(({ row, errors }) => `Row ${row}: ${errors.join(", ")}`)
        .join("\n");

      // alert(`Please fix the following issues:\n\n${errorMessage}`);
      alert(
        "Please fill all required fields in each row (Description, Account Type, Account, and either Debit or Credit)."
      );
      return;
    }

    if (subtotalDebit !== subtotalCredit) {
      alert("Credit and Debit totals must be equal before saving.");
      return;
    }

    // Classify transactions into income and expense
    const { income, expense } = classifyTransactions(tableData);

    // Clean the income and expense arrays, adding the date to each entry
    const cleanedIncome = cleanData(income, date);
    const cleanedExpense = cleanData(expense, date);

    const creditTotal = tableData.reduce(
      (acc, row) => acc + parseFloat(row.credit || 0),
      0
    );

    const debitTotal = tableData.reduce(
      (acc, row) => acc + parseFloat(row.debit || 0),
      0
    );

    // console.log("Cleaned Income with Date:", cleanedIncome);
    // console.log("Cleaned Expense with Date:", cleanedExpense);
    // console.log("creditTotal", creditTotal);
    // console.log("debitTotal:", debitTotal);

    try {
      const response = await fetch(`${API_BASE_URL}/addJournal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          narration,
          date,
          incomes: cleanedIncome,
          expenses: cleanedExpense,
          creditTotal: creditTotal,
          debitTotal: debitTotal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const journalID = data.journalID;

        setSnackbar({
          open: true,
       message:"Journal added Successfully" ,
          severity: "success",
        });
      }

      // Further processing
      setTimeout(() => {
        navigate("/ManualJournal/");
      }, 2000);
      
    } catch (error) {
      alert(error.message);
    }
  };

  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-4 bg-white shadow rounded-lg h-[70px]">
        <span className="text-gray-700 font-semibold text-lg">Add Journal</span>
      </div>
      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded mb-4">
        <p>
          <strong>Info:</strong> We recommend that only your accountant or
          bookkeeper create journals unless you have experience managing your
          general ledger.
        </p>
      </div>
      <div className="p-2 bg-white rounded-lg shadow-lg max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full p-4 border-b bg-white rounded-t-lg relative md:p-4 z-10">
          <div className="flex items-center gap-x-4">
            <div>
              <label htmlFor="narration" className="block text-sm font-medium">
                Narration
              </label>
              <input
                id="narration"
                type="input"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="w-[350px] h-12 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-4 py-3 border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* <div className="relative inline-block" ref={dropdownTaxREF}>
            <div
              className="flex border items-center bg-white px-2 py-1 rounded focus:outline-none cursor-pointer"
              onClick={toggleDropdown}
            >
              <button className="w-[100px] text-right">{taxDropDown}</button>
              <FaAngleDown className="text-primary" />
            </div>
            <div
              className={`absolute w-[140px] top-full p-2 left-0 mt-2 bg-gray-100 bordershadow-xl rounded-xl z-10 ${
                isOpenDropDown ? "block" : "hidden"
              }`}
            >
              {dropdownOptions.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2  hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                  onClick={() => handleSelectionIncomeExpense(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div> */}
        </div>

        <div className="w-full relative mt-4 p-4">
          <div className="overflow-x-auto max-w-full">
            <DataTable
              headers={headers}
              onRowsChange={handleRowsChange}
              accountType={accountType}
              initialRows={tableData}
            />
          </div>

          {/* Subtotals and Totals */}
          <div className="flex w-full justify-end mt-4 border-t pt-4">
            <div className=" w-[400px]">
              {/* <div className="flex justify-between text-md">
                <div>Subtotal Debit: {subtotalDebit.toFixed(2)}</div>
                <div>Subtotal Credit: {subtotalCredit.toFixed(2)}</div>
              </div>
              <div className="flex justify-between text-md mt-2">
                <div>Total Tax (Debit): {taxTotalDebit.toFixed(2)}</div>
                <div>Total Tax (Credit): {taxTotalCredit.toFixed(2)}</div>
              </div> */}
              <div className="flex justify-between text-md mt-2 font-bold">
                <div>Total Debit: {totalDebit.toFixed(2)}</div>
                <div>Total Credit: {totalCredit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-x-4 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Save
            </button>
            <button
              onClick={() => navigate("/ManualJournal")}
              className="px-4 py-2 bg-red-500 text-white rounded transition duration-300 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
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
    </div>
  );
}

export default AddManualJournal;
