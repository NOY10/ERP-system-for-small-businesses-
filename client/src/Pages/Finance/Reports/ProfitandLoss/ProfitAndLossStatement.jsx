import React, { useEffect, useState } from "react";
import useAuthStore from "../../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import getMonthsInRange from "../Month";
import { format } from "date-fns";
import useCompanyStore from "../../../../store/useCompanyStore";

import { API_BASE_URL } from "../../../../config/api";

const ProfitAndLossStatement = ({ comparisonData }) => {
  const [incomeHeaders, setIncomeHeaders] = useState([]);
  const [expenseHeaders, setExpenseHeaders] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profitandLossSheet, setProfitandLossSheet] = useState(
    "Profit and Loss Report"
  );
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { companyInfo } = useCompanyStore();

  useEffect(() => {
    const fetchAndProcessAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAllAccounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }

        const data = await response.json();
        const accounts = data.accounts;

        // Filter and group income headers
        const incomeTypes = ["Revenue", "Sales", "Other Income"];
        const processedIncomeHeaders = accounts
          .filter((account) => incomeTypes.includes(account.type))
          .reduce((acc, curr) => {
            const existingHeader = acc.find(
              (header) => header.name === curr.type
            );
            if (existingHeader) {
              existingHeader.subheader.push(`${curr.code}-${curr.name}`);
            } else {
              acc.push({
                name: curr.type,
                subheader: [`${curr.code}-${curr.name}`],
              });
            }
            return acc;
          }, []);

        // Filter and group expense headers
        const expenseTypes = [
          "Direct Expense",
          "Other Expense",
          "Operating Expenses",
          "Cost of Goods Sold (COGS)",
        ];
        const processedExpenseHeaders = accounts
          .filter((account) => expenseTypes.includes(account.type))
          .reduce((acc, curr) => {
            const existingHeader = acc.find(
              (header) => header.name === curr.type
            );
            if (existingHeader) {
              existingHeader.subheader.push(`${curr.code}-${curr.name}`);
            } else {
              acc.push({
                name: curr.type,
                subheader: [`${curr.code}-${curr.name}`],
              });
            }
            return acc;
          }, []);

        setIncomeHeaders(processedIncomeHeaders);
        setExpenseHeaders(processedExpenseHeaders);
      } catch (error) {
        console.error("Error fetching or processing accounts:", error);
      }
    };

    fetchAndProcessAccounts();
  }, [token]);

  useEffect(() => {
    const groupBySubheader = (data, subheader) =>
      data
        .filter((item) => subheader.includes(item.subheader))
        .reduce((acc, curr) => {
          acc[curr.subheader] = (acc[curr.subheader] || 0) + curr.amount;
          return acc;
        }, {});

    if (
      !comparisonData.length ||
      !incomeHeaders.length ||
      !expenseHeaders.length
    )
      return;

    const processedIncomeData = comparisonData.map((periodData) =>
      incomeHeaders.reduce((acc, header) => {
        acc[header.name] = groupBySubheader(
          periodData.data.filter((item) => item.type === "income"),
          header.subheader
        );
        return acc;
      }, {})
    );

    const processedExpenseData = comparisonData.map((periodData) =>
      expenseHeaders.reduce((acc, header) => {
        acc[header.name] = groupBySubheader(
          periodData.data.filter((item) => item.type === "expense"),
          header.subheader
        );
        return acc;
      }, {})
    );

    setIncomeData(processedIncomeData);
    setExpenseData(processedExpenseData);

    // Calculate Gross Profit and Net Profit for all periods
    const profitCalculations = comparisonData.map((_, periodIndex) => {
      const revenue = sumValues(
        processedIncomeData[periodIndex]?.["Revenue"] || {}
      );
      const sales = sumValues(
        processedIncomeData[periodIndex]?.["Sales"] || {}
      );
      const otherIncome = sumValues(
        processedIncomeData[periodIndex]?.["Other Income"] || {}
      );
      const directExpense = sumValues(
        processedExpenseData[periodIndex]?.["Direct Expense"] || {}
      );
      const cogs = sumValues(
        processedExpenseData[periodIndex]?.["Cost of Goods Sold (COGS)"] || {}
      );
      const operatingExpenses = sumValues(
        processedExpenseData[periodIndex]?.["Operating Expenses"] || {}
      );
      const otherExpense = sumValues(
        processedExpenseData[periodIndex]?.["Other Expense"] || {}
      );

      const grossProfit = revenue + sales - (directExpense + cogs);
      const netProfit =
        revenue +
        sales +
        otherIncome -
        (directExpense + cogs + operatingExpenses + otherExpense);

      return { grossProfit, netProfit };
    });

    setProfitData(profitCalculations);
  }, [comparisonData, incomeHeaders, expenseHeaders]);

  const handleSubheaderClick = (subheader, type) => {
    const basePath = type === "income" ? "/Income" : "/Expense";
    navigate(`${basePath}`);
  };

  const sumValues = (obj) =>
    obj ? Object.values(obj).reduce((sum, value) => sum + value, 0) : 0;

  // const renderTableRows = (headers, data, type) =>
  //   headers.map((header, headerIndex) => {
  //     const rows = header.subheader
  //       .filter((sub) =>
  //         comparisonData.some(
  //           (_, periodIndex) => data[periodIndex]?.[header.name]?.[sub] !== 0
  //         )
  //       )
  //       .map((sub, subIndex) => (
  //         <tr
  //           key={`sub-${header.name}-${subIndex}`}
  //           className="hover:bg-blue-50"
  //         >
  //           <td
  //             className=" pl-3 text-gray-700 hover:text-blue-500 hover:underline cursor-pointer p-1.5"
  //             onClick={() => handleSubheaderClick(sub, type)}
  //           >
  //             {sub.split("-")[1]}
  //           </td>
  //           {comparisonData.map((_, periodIndex) => (
  //             <td
  //               key={`sub-${header.name}-${subIndex}-${periodIndex}`}
  //               className="text-center"
  //             >
  //               {(data[periodIndex]?.[header.name]?.[sub] || 0).toFixed(2)}
  //             </td>
  //           ))}
  //         </tr>
  //       ));

  //     return (
  //       <React.Fragment key={`header-${headerIndex}`}>
  //         <tr key={`header-row-${headerIndex}`} class>
  //           <td
  //             colSpan={comparisonData.length + 1}
  //             className="text-blue-500 text-lg mb-4"
  //           >
  //             {header.name}
  //           </td>
  //         </tr>
  //         {rows}
  //         <tr
  //           className="font-bold text-gray-600 border-t border-dashed mb-4 pl-3"
  //           key={`total-row-${headerIndex}`}
  //         >
  //           <td className=" pb-4 pl-3 ">Total {header.name}</td>
  //           {comparisonData.map((_, periodIndex) => (
  //             <td
  //               key={`total-${headerIndex}-${periodIndex}`}
  //               className="text-blue-500 text-center pb-2 mb-4"
  //             >
  //               {sumValues(data[periodIndex]?.[header.name] || {}).toFixed(2)}{" "}
  //             </td>
  //           ))}
  //         </tr>
  //       </React.Fragment>
  //     );
  //   });
  const renderTableRows = (headers, data, type) =>
    headers.map((header, headerIndex) => {
      // Filter subheaders that have at least one non-zero value in the comparison periods
      const filteredSubheaders = header.subheader.filter((sub) =>
        comparisonData.some(
          (_, periodIndex) =>
            data[periodIndex]?.[header.name]?.[sub] !== undefined &&
            data[periodIndex]?.[header.name]?.[sub] !== 0
        )
      );

      const rows = filteredSubheaders.map((sub, subIndex) => (
        <tr key={`sub-${header.name}-${subIndex}`} className="hover:bg-blue-50">
          <td
            className="pl-3 text-gray-700 hover:text-blue-500 hover:underline cursor-pointer p-1.5"
            onClick={() => handleSubheaderClick(sub, type)}
          >
            {sub.split("-")[1]}
          </td>
          {comparisonData.map((_, periodIndex) => (
            <td
              key={`sub-${header.name}-${subIndex}-${periodIndex}`}
              className="text-center"
            >
              {(data[periodIndex]?.[header.name]?.[sub] || 0).toFixed(2)}
            </td>
          ))}
        </tr>
      ));

      if (rows.length === 0) return null; // Skip headers with no rows

      return (
        <React.Fragment key={`header-${headerIndex}`}>
          <tr key={`header-row-${headerIndex}`}>
            <td
              colSpan={comparisonData.length + 1}
              className="text-blue-500 text-lg mb-4"
            >
              {header.name}
            </td>
          </tr>
          {rows}
          <tr
            className="font-bold text-gray-600 border-t border-dashed mb-4 pl-3"
            key={`total-row-${headerIndex}`}
          >
            <td className="pb-4 pl-3">Total {header.name}</td>
            {comparisonData.map((_, periodIndex) => (
              <td
                key={`total-${headerIndex}-${periodIndex}`}
                className="text-blue-500 text-center pb-2 mb-4"
              >
                {sumValues(data[periodIndex]?.[header.name] || {}).toFixed(2)}{" "}
              </td>
            ))}
          </tr>
        </React.Fragment>
      );
    });

  return (
    <div className="bg-white p-2">
      <div className="text-center mb-3 p-2">
        <h1 className="text-xl font-semibold">
          {companyInfo.name || "NO COMPANY NAME"}
        </h1>

        {/* Editable Section */}
        <div className="mt-1 flex justify-center">
          <h1
            className="text-center font-bold text-gray-700 cursor-pointer"
            onClick={() => setEditing(true)}
          >
            {editing ? (
              <input
                type="text"
                value={profitandLossSheet}
                onChange={(e) => setProfitandLossSheet(e.target.value)}
                onBlur={() => setEditing(false)}
                autoFocus
                className="border-b-2 border-gray-300 rounded-none w-full"
              />
            ) : (
              profitandLossSheet
            )}
          </h1>
        </div>
        <h6 className="text-gray-600 mt-2 font-medium">
          {format(new Date(), "MMMM dd, yyyy")}
        </h6>
      </div>
      <div className="p-4 border rounded bg-white ">
        <table className="table-auto w-full ">
          <thead className="border-b border-gary-200">
            <tr>
              <th className="text-left">Account</th>
              {comparisonData.map((period, index) => (
                <th key={index} className="text-center">
                  {getMonthsInRange(period.period)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderTableRows(incomeHeaders, incomeData, "income")}
            {renderTableRows(expenseHeaders, expenseData, "expense")}
            <tr className="font-bold  border-t pt-4">
              <td>Gross Profit</td>
              {profitData.map((profit, index) => (
                <td
                  key={index}
                  className={`text-center ${
                    profit.grossProfit >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {profit.grossProfit.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr className="font-bold">
              <td>Net Profit</td>
              {profitData.map((profit, index) => (
                <td
                  key={index}
                  className={`text-center pt-2 ${
                    profit.netProfit >= 0 ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {profit.netProfit.toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitAndLossStatement;
