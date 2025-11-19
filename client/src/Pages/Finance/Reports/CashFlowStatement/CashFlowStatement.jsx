import React from "react";
import getMonthsInRange from "../Month";
import useCompanyStore from "../../../../store/useCompanyStore";

const CashFlowTable = ({ data, onAccountClick }) => {
  const { companyInfo } = useCompanyStore();

  // Categorize accounts, excluding those with a netFlow of 0
  const categorizeAccounts = (accounts = [], category) => {
    return accounts.filter(
      (acc) => acc.category === category && acc.netFlow !== 0
    );
  };

  // Calculate total inflows, outflows, and net cash flow
  const calculateTotals = (accounts) => {
    const totalInflows = accounts.reduce((sum, acc) => sum + acc.inflows, 0);
    const totalOutflows = accounts.reduce((sum, acc) => sum + acc.outflows, 0);
    return {
      totalInflows,
      totalOutflows,
      netCashFlow: totalInflows - totalOutflows,
    };
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {companyInfo.name || "NO COMPANY NAME"}
        </h1>
        <h2 className="text-lg font-medium text-gray-500 mt-1">
          Cash Flow Statement as of {new Date().toLocaleDateString()}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-gray-700 font-semibold border-b">
              <th className="px-4 py-3 text-left">Account Name</th>
              {data.map((dataset, index) => (
                <th key={index} className="px-4 py-3 text-right">
                  {getMonthsInRange(dataset.date)}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Net Cash Flow</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Operating Activities",
              "Investing Activities",
              "Financing Activities",
            ].map((category) => (
              <React.Fragment key={category}>
                {/* Category Header */}
                <tr className="bg-gray-50">
                  <td
                    className="px-4 py-3 font-bold text-lg text-blue-500"
                    colSpan={data.length + 2} // +2 for all columns including totals
                  >
                    {category}
                  </td>
                </tr>

                {/* Accounts within the category */}
                {data[0]?.data &&
                  categorizeAccounts(data[0].data, category)
                    .filter((account) => {
                      // Calculate the total balance for this account across all datasets
                      const totalBalance = data
                        .map((dataset) => {
                          const matchingAccount = dataset.data.find(
                            (acc) => acc.accountName === account.accountName
                          );
                          return matchingAccount ? matchingAccount.netFlow : 0;
                        })
                        .reduce((sum, val) => sum + val, 0);
                      return totalBalance !== 0;
                    })
                    .map((account, accIndex) => (
                      <tr key={accIndex} className="hover:bg-gray-100">
                        <td
                          className="pl-8 py-2 text-gray-700 hover:text-blue-500 hover:underline cursor-pointer"
                          onClick={() => onAccountClick(account)}
                        >
                          {account.accountName}
                        </td>
                        {data.map((dataset, index) => {
                          const matchingAccount = dataset.data.find(
                            (acc) => acc.accountName === account.accountName
                          );
                          return (
                            <td
                              key={index}
                              className="px-4 py-2 text-right text-gray-800"
                            >
                              {matchingAccount
                                ? matchingAccount.netFlow.toLocaleString()
                                : "0"}{" "}
                              Nu.
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-right font-semibold">
                          {data
                            .map((dataset) => {
                              const matchingAccount = dataset.data.find(
                                (acc) => acc.accountName === account.accountName
                              );
                              return matchingAccount
                                ? matchingAccount.netFlow
                                : 0;
                            })
                            .reduce((sum, val) => sum + val, 0)
                            .toLocaleString()}{" "}
                          Nu.
                        </td>
                      </tr>
                    ))}

                {/* Totals for the category */}
                <tr className="font-bold border-t border-gray-300 border-dashed">
                  <td className="px-8 py-2">Total {category}</td>
                  {data.map((dataset, index) => {
                    const accounts = categorizeAccounts(dataset.data, category);
                    const { netCashFlow } = calculateTotals(accounts);
                    return (
                      <td key={index} className="px-4 py-2 text-right">
                        {netCashFlow.toLocaleString()} Nu.
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right font-bold text-blue-900">
                    {data
                      .map((dataset) => {
                        const accounts = categorizeAccounts(
                          dataset.data,
                          category
                        );
                        const { netCashFlow } = calculateTotals(accounts);
                        return netCashFlow;
                      })
                      .reduce((sum, val) => sum + val, 0)
                      .toLocaleString()}{" "}
                    Nu.
                  </td>
                </tr>
              </React.Fragment>
            ))}

            {/* Overall Net Cash Flow */}
            <tr className="text-blue-500 font-bold bg-gray-50">
              <td className="px-4 py-2">Net Cash Flow</td>
              {data.map((dataset, index) => {
                const totalNetCashFlow = [
                  "Operating Activities",
                  "Investing Activities",
                  "Financing Activities",
                ]
                  .map((category) => {
                    const accounts = categorizeAccounts(dataset.data, category);
                    const { netCashFlow } = calculateTotals(accounts);
                    return netCashFlow;
                  })
                  .reduce((sum, val) => sum + val, 0);
                return (
                  <td key={index} className="px-4 py-2 text-right">
                    {totalNetCashFlow.toLocaleString()} Nu.
                  </td>
                );
              })}
              <td className="px-4 py-2 text-right font-extrabold">
                {data
                  .map((dataset) => {
                    return [
                      "Operating Activities",
                      "Investing Activities",
                      "Financing Activities",
                    ]
                      .map((category) => {
                        const accounts = categorizeAccounts(
                          dataset.data,
                          category
                        );
                        const { netCashFlow } = calculateTotals(accounts);
                        return netCashFlow;
                      })
                      .reduce((sum, val) => sum + val, 0);
                  })
                  .reduce((sum, val) => sum + val, 0)
                  .toLocaleString()}{" "}
                Nu.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashFlowTable;
