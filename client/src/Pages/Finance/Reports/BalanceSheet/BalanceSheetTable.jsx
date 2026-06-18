import React, { useState } from "react";
import getMonthsInRange from "../Month";
import { format } from "date-fns";
import useCompanyStore from "../../../../store/useCompanyStore";

const BalanceSheetTable = ({ data, onAccountClick }) => {
  const [editing, setEditing] = useState(false);
  const [balanceSheet, setBalanceSheet] = useState("Balance Sheet");
  const { companyInfo } = useCompanyStore();

  const categorizeAccounts = (accounts, type, category = null) => {
    return accounts.filter(
      (acc) =>
        acc.accountType === type &&
        (category ? acc.category === category : true)
    );
  };

  const calculateTotal = (accounts) => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg mt-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {companyInfo.name || "NO COMPANY NAME"}
        </h1>
        <div className="mt-2">
          <h1
            className="text-lg font-bold text-gray-700 cursor-pointer"
            onClick={() => setEditing(true)}
          >
            {editing ? (
              <input
                type="text"
                value={balanceSheet}
                onChange={(e) => setBalanceSheet(e.target.value)}
                onBlur={() => setEditing(false)}
                autoFocus
                className="border-b-2 border-gray-300 rounded-none focus:outline-none focus:border-blue-500"
              />
            ) : (
              balanceSheet
            )}
          </h1>
        </div>
        <h6 className="text-gray-600 mt-2 font-medium">
          {format(new Date(), "MMMM dd, yyyy")}
        </h6>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-semibold border-b">
              <th className="px-6 py-3 text-left">Category</th>
              {data.map((dataset, index) => (
                <th key={index} className="px-6 py-3 text-right">
                  {getMonthsInRange(dataset.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Assets", type: "Asset", hasSubcategories: true },
              {
                label: "Liabilities",
                type: "Liability",
                hasSubcategories: true,
              },
              { label: "Equity", type: "Equity", hasSubcategories: false },
            ].map((category) => (
              <React.Fragment key={category.label}>
                <tr className="bg-blue-50">
                  <td
                    className="px-6 py-3 font-bold text-lg text-gray-900"
                    colSpan={data.length + 1}
                  >
                    {category.label}
                  </td>
                </tr>

                {category.hasSubcategories ? (
                  // For Assets and Liabilities with Current and Non-Current subcategories
                  ["Current", "Non-Current"].map((subCategory) => {
                    const hasValues = data.some((dataset) => {
                      const accounts = categorizeAccounts(
                        dataset.data,
                        category.type,
                        subCategory
                      );
                      return accounts.some((acc) => acc.balance !== 0);
                    });

                    if (!hasValues) return null;

                    return (
                      <React.Fragment key={subCategory}>
                        <tr>
                          <td
                            className="px-8 py-2 font-semibold text-blue-500"
                            colSpan={data.length + 1}
                          >
                            {subCategory} {category.label}
                          </td>
                        </tr>

                        {categorizeAccounts(
                          data[0]?.data || [],
                          category.type,
                          subCategory
                        )
                          .filter((account) => account.balance !== 0)
                          .map((account, accIndex) => (
                            <tr key={accIndex} className="hover:bg-gray-100">
                              <td className="pl-12 py-2 text-gray-700 hover:text-blue-500 hover:underline cursor-pointer">
                                {account.accountName}
                              </td>
                              {data.map((dataset, index) => {
                                const matchingAccount = dataset.data.find(
                                  (acc) =>
                                    acc.accountName === account.accountName
                                );
                                return (
                                  <td
                                    key={index}
                                    className="px-6 py-2 text-right text-gray-800"
                                  >
                                    {matchingAccount
                                      ? matchingAccount.balance.toLocaleString()
                                      : "0"}{" "}
                                    Nu.
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                        <tr className="font-bold text-gray-800">
                          <td className="px-8 py-2">
                            Total {subCategory} {category.label}
                          </td>
                          {data.map((dataset, index) => {
                            const accounts = categorizeAccounts(
                              dataset.data,
                              category.type,
                              subCategory
                            );
                            return (
                              <td key={index} className="px-6 py-2 text-right">
                                {calculateTotal(accounts).toLocaleString()} Nu.
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })
                ) : (
                  // For Equity - display all equity accounts without subcategories
                  <>
                    {categorizeAccounts(data[0]?.data || [], category.type)
                      .filter((account) => account.balance !== 0)
                      .map((account, accIndex) => (
                        <tr key={accIndex} className="hover:bg-gray-100">
                          <td className="pl-12 py-2 text-gray-700 hover:text-blue-500 hover:underline cursor-pointer">
                            {account.accountName}
                          </td>
                          {data.map((dataset, index) => {
                            const matchingAccount = dataset.data.find(
                              (acc) => acc.accountName === account.accountName
                            );
                            return (
                              <td
                                key={index}
                                className="px-6 py-2 text-right text-gray-800"
                              >
                                {matchingAccount
                                  ? matchingAccount.balance.toLocaleString()
                                  : "0"}{" "}
                                Nu.
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                )}

                <tr className="text-blue-400 font-bold">
                  <td className="px-6 py-2">Total {category.label}</td>
                  {data.map((dataset, index) => {
                    const accounts = categorizeAccounts(
                      dataset.data,
                      category.type
                    );
                    return (
                      <td key={index} className="px-6 py-2 text-right">
                        {calculateTotal(accounts).toLocaleString()} Nu.
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
            <tr className="text-blue-500 font-semibold bg-gray-100">
              <td className="px-6 py-2 font-bold">
                Total Liabilities + Equity
              </td>
              {data.map((dataset, index) => {
                const liabilities = categorizeAccounts(
                  dataset.data,
                  "Liability"
                );
                const equity = categorizeAccounts(dataset.data, "Equity");
                const total =
                  calculateTotal(liabilities) + calculateTotal(equity);
                return (
                  <td key={index} className="px-6 py-2 text-right">
                    {total.toLocaleString()} Nu.
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceSheetTable;
