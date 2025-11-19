import React from "react";
import {
  FaChartPie,
  FaBalanceScale,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const navigate = useNavigate();

  const financialStatements = [
    {
      id: 1,
      title: "Profit & Loss",
      description:
        "View your company's revenue, expenses, and overall profitability",
      icon: <FaChartPie className="w-12 h-12 text-blue-600" />,
      link: "/Reports/ProfitandLoss",
    },
    {
      id: 2,
      title: "Balance Sheet",
      description: "Track your assets, liabilities, and equity positions",
      icon: <FaBalanceScale className="w-12 h-12 text-green-600" />,
      link: "/Reports/BalanceSheet",
    },
    {
      id: 3,
      title: "Cash Flow",
      description: "Monitor your cash inflows and outflows over time",
      icon: <FaMoneyBillWave className="w-12 h-12 text-purple-600" />,
      link: "/Reports/CashFlowStatement",
    },
    {
      id: 4,
      title: "Trial Balance",
      description:
        "Review your debits and credits to ensure accounting accuracy",
      icon: <FaFileInvoiceDollar className="w-12 h-12 text-red-600" />,
      link: "/Reports/TrialBalance",
    },
  ];

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Financial Statements Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your company's financial health at a glance
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStatements.map((statement) => (
            <div
              key={statement.id}
              onClick={() => navigate(statement.link)}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-4">
                {statement.icon}
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 transition-colors duration-300">
                {statement.title}
              </h3>
              <p className="text-gray-600 text-center text-sm transition-colors duration-300">
                {statement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;
