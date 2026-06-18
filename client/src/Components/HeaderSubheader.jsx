import React, { useEffect, useRef, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import AddAccount from "../Pages/Finance/Accountant/ChartsOfAccount/AddAccount";
import useAuthStore from "../store/useAuthStore";

import { API_BASE_URL } from "../config/api";

const ExpenseDropdown = ({
  selectedHeader,
  selectedSubheader,
  onHeaderChange,
  onSubheaderChange,
}) => {
  const [header, setHeader] = useState("");
  const [subheader, setSubheader] = useState("Select Subheader");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenHead, setDropdownOpenHead] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const dropdownRef = useRef(null);
  const dropdownHeadRef = useRef(null);

  const filteredCategories = categories.filter((sub) =>
    sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Predefined headers and subheaders
  const headers = [
    {
      name: "Assets",
      subheaders: ["Current Asset", "Non-current Asset"],
    },
    {
      name: "Liabilities",
      subheaders: ["Current Liability", "Non-current Liability"],
    },
    {name: "Equity", subheaders: ["Equity"] },
    {
      name: "Expenses",
      subheaders: [
        "Direct Expense",
        "Other Expense",
        "Cost of Goods Sold (COGS)",
        "Operating Expenses",
      ],
    },
    {
      name: "Revenue/Income",
      subheaders: ["Revenue", "Sales", "Other Income"],
    },

  ];
  const { token } = useAuthStore();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        dropdownHeadRef.current &&
        !dropdownHeadRef.current.contains(event.target)
      ) {
        setDropdownOpenHead(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Fetch categories based on selected subheader
  const fetchCategories = async (header) => {
    setLoading(true);
    try {
      console.log("Fetching data for header:", header);

      const response = await fetch(
        `${API_BASE_URL}/getAccountsByType?type=${header}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Data:", data.accounts);

        // Extract all names from the accounts array

        const categoryNames = data.accounts.map(
          (account) => `${account.code}-${account.name}`
        );

        // Update the categories state with the extracted names
        setCategories(categoryNames);
      } else {
        console.error("Failed to fetch categories:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle header change
  const handleHeaderChange = (header) => {
    onHeaderChange(header);
    setHeader(header);
    setCategories([]);
    fetchCategories(header);
  };

  // Handle subheader change
  const handleSubheaderChange = (subheader) => {
    setSubheader(subheader);
    onSubheaderChange(subheader);
  };

  return (
    <div className=" w-full md:col-span-2 grid grid-cols-2 gap-6">
      <div className="col-span-2">
        <label className="block font-medium mb-2 text-blue-500">Header</label>
        <div ref={dropdownHeadRef} className="relative">
          <div
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex justify-between items-center bg-white"
            onClick={() => setDropdownOpenHead(!dropdownOpenHead)}
          >
            <span>{selectedHeader || "Select a header"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${
                dropdownOpenHead ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {dropdownOpenHead && (
            <ul className="absolute left-0 right-0 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {headers.map((h) => (
                <li key={h.name} className="py-1">
                  <div className="px-2 py-2 font-bold text-blue-500">
                    {h.name}
                  </div>
                  <ul className="ml-6">
                    {h.subheaders.map((sub, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          handleHeaderChange(sub);
                          setDropdownOpenHead(false);
                        }}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Subheader Dropdown */}
      {header && (
        <div className="col-span-2">
          <label className="block font-medium mb-2 text-blue-500">
            Subheader
          </label>
          <div ref={dropdownRef} className="relative">
            <input
              type="text"
              placeholder="Select or search subheader..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
              value={searchTerm || selectedSubheader || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                if (!dropdownOpen) {
                  setSearchTerm("");
                }
              }}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute top-1/2 right-3 h-5 w-5 transform -translate-y-1/2 cursor-pointer transition-transform duration-300 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>

            {/* Dropdown List */}
            {dropdownOpen && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {loading ? (
                  // Loader
                  <li className="px-4 py-2 text-center">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500 mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V4a8 8 0 00-8 8z"
                      ></path>
                    </svg>
                  </li>
                ) : (
                  <>
                    {/* Add New Account Button */}
                    <li className="px-4 py-2 border-b">
                      <button
                        className="w-full px-4 py-2 flex items-center gap-x-2 text-blue-500 hover:bg-blue-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowAddAccount(true);
                        }}
                      >
                        <IoMdAddCircle className="text-xl" />
                        <span>Add New Account</span>
                      </button>
                    </li>
                    {filteredCategories.length > 0 ? (
                      (!searchTerm && !dropdownOpen
                        ? filteredCategories
                        : categories
                      ).map((sub, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => {
                            setSearchTerm(sub);
                            handleSubheaderChange(sub);
                            setDropdownOpen(false);
                          }}
                        >
                          {sub}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">
                        No results found
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* {showAddAccount && <AddAccount />} */}
      {showAddAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
              onClick={() => setShowAddAccount(false)}
            >
              &times;
            </button>
            <AddAccount
              onAddAccount={() => {
                setShowAddAccount(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDropdown;
