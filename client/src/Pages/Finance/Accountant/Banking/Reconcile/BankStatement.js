import React, { useState, useEffect } from "react";
import { CgArrowsExchange } from "react-icons/cg";
import BankS from "../BankStatement/BankS";

function BankStatement({
  date,
  name,
  accountNumber,
  transactionNumber,
  transactionType,
  spent,
  received,
  transactionData,
}) {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("match");
  const [isMatchActive, setIsMatchActive] = useState(false);

  useEffect(() => {
    // Ensure transactionData is unique based on transactionNumber (or any unique identifier)
    const uniqueTransactions = Array.from(
      new Map(
        transactionData.map((trans) => [trans.transactionNumber, trans])
      ).values()
    );
    setTransactions(uniqueTransactions);
  }, [transactionData]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== "match") {
      setIsMatchActive(false);
    }
  };

  const handleFindClick = () => {
    setIsMatchActive(true);
  };

  // Function to handle confirming a transaction (removal)
  const handleConfirm = (transactionNumber) => {
    setTransactions((prev) =>
      prev.filter((trans) => trans.transactionNumber !== transactionNumber)
    );
  };

  // Compare bank data with transaction data
  const matchedTransaction = transactionData.find((trans) => {
    return (
      trans.transactionDate === date &&
      trans.agencyName === name &&
      trans.accountNumber === accountNumber &&
      trans.transactionType === transactionType &&
      trans.spent === spent &&
      trans.received === received
    );
  });

  return (
    <div className="relative">
      {transactions.map((transaction) => (
        <div
          key={transaction.transactionNumber}
          id={`transaction-row-${transaction.transactionNumber}`}
          className="relative"
        >
          <div className="flex gap-x-4">
            {/* First Div (Fixed/Sticky Section) */}
            <div className="flex-1 bg-white border border-gray-200 p-4 flex justify-between h-32 relative">
              {/* Left Section */}
              <div>
                <p className="text-gray-600 text-sm">{date}</p>
                <p className="text-gray-900 font-semibold">{name}</p>
                <p className="text-gray-600 text-sm">{transactionType}</p>
              </div>
              <div className="absolute left-3/4 top-0 h-full border-l border-gray-300"></div>
              <div className="flex space-x-10 mr-4">
                {spent > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm">Spent</p>
                    <p className="text-blue-400 font-bold">{spent}</p>
                  </div>
                )}
                {spent <= 0 && received > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm">Received</p>
                    <p className="text-gray-900 font-bold">{received}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <CgArrowsExchange className="text-blue-500 text-4xl mt-9" />
            </div>

            {/* Tabs Section */}
            <div className="flex-1 bg-white border border-gray-200 p-6 mb-4">
              <div className="flex space-x-4 border-b border-gray-300 pb-2 mb-4">
                <button
                  className={`${
                    activeTab === "match"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                  onClick={() => handleTabClick("match")}
                >
                  Match
                </button>
                <button
                  className={`${
                    activeTab === "create"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                  onClick={() => handleTabClick("create")}
                >
                  Create
                </button>
              </div>

              {/* Conditional Content Based on Active Tab */}
              <div>
                {activeTab === "match" && (
                  <div>
                    {matchedTransaction ? (
                      <div>
                        <div className="flex-1 bg-white border p-2 flex justify-between h-32 relative">
                          {/* Left Section */}
                          <div>
                            <p className="text-gray-600 text-sm">
                              {matchedTransaction.transactionDate}
                            </p>
                            <p className="text-gray-900 font-semibold">
                              {name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {transactionType}
                            </p>
                          </div>

                          {/* Vertical Line */}
                          <div className="absolute left-3/4 top-0 h-full border-l border-gray-300"></div>

                          {/* Right Section */}
                          <div className="flex space-x-10 mr-4">
                            {/* Display Spent if it exists */}
                            {spent > 0 && (
                              <div>
                                <p className="text-gray-600 text-sm">Spent</p>
                                <p className="text-blue-400 font-bold">
                                  {spent}
                                </p>
                              </div>
                            )}

                            {/* Display Received if Spent doesn't exist and Received exists */}
                            {spent <= 0 && received > 0 && (
                              <div>
                                <p className="text-gray-600 text-sm">
                                  Received
                                </p>
                                <p className="text-gray-900 font-bold">
                                  {received}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              handleConfirm(transaction.transactionNumber)
                            } // Use transactionNumber to confirm
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm mt-1 "
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ) : (
                      // If no match found, display "Find" button
                      <button
                        onClick={handleFindClick}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Find
                      </button>
                    )}
                  </div>
                )}

                {activeTab === "create" && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700">Who</label>
                        <input
                          type="text"
                          placeholder="Name of the contact..."
                          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700">What</label>
                        <select className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Sales Expense</option>
                          <option>Services</option>
                          <option>Travel</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700 mb-1">Why</label>
                        <input
                          type="text"
                          placeholder="Enter a description..."
                          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Content (Full Width) - Only Display on Find Button Click */}
          {isMatchActive && (
            <div className=" -mt-4 left-0 w-full bg-white p-4 border border-gray-300 z-10 mb-3 rounded-sm shadow-lg">
              <h2 className="font-semibold text-lg mb-4">
                Find & Select Matching Transactions
              </h2>
              {/* <div className="flex items-center justify-between mb-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Show Received Items</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by name or reference"
                  className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                  Go
                </button>
              </div> */}

              <BankS />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BankStatement;
