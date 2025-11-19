import React, { useRef, useState, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";
import useAuthStore from "../../../../store/useAuthStore";
import AddAccount from "../ChartsOfAccount/AddAccount";
import { createPortal } from "react-dom";
import DialogBox from "../../../../Components/Dialogbox";
import { IoMdAddCircle } from "react-icons/io";

const DataTable = ({
  headers = [],
  accountType = [],
  initialRows = [],
  onRowsChange = () => {},
}) => {
  const [rows, setRows] = useState(
    initialRows.length > 0 ? initialRows : [{}, {}, {}]
  );
  const [dropdownState, setDropdownState] = useState(
    initialRows.map(() => ({
      subheaders: [],
      taxRate: [],
      filtered: [],
      loading: false,
    }))
  );
  const [visibleDropdownIndex, setVisibleDropdownIndex] = useState(null);
  const [visibleDropdownHeaderIndex, setVisibleDropdownHeaderIndex] =
    useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownHeaderPosition, setDropdownHeaderPosition] = useState({
    top: 0,
    left: 0,
  });
  const [showAddAccount, setShowAddAccount] = useState(false);

  const { token } = useAuthStore();
  const dropdownRefs = useRef([]);
  const dropdownRefsHeader = useRef([]);

  // Sync state when initialRows changes
  useEffect(() => {
    if (initialRows.length > 0) {
      setRows(initialRows);
      setDropdownState(
        initialRows.map(() => ({
          subheaders: [],
          taxRate: [],
          filtered: [],
          loading: false,
        }))
      );
    }
  }, [initialRows]);

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;

    const updatedRows = rows.map((row, rowIndex) => {
      if (rowIndex === index) {
        if (name === "credit") {
          return { ...row, credit: value, debit: "0" };
        }
        if (name === "debit") {
          return { ...row, debit: value, credit: "0" };
        }
        return { ...row, [name]: value };
      }
      return row;
    });

    setRows(updatedRows);
    onRowsChange(updatedRows);
  };

  const addRow = () => {
    const newRow = headers.reduce((acc, header) => {
      if (header.field) acc[header.field] = "";
      return acc;
    }, {});

    setRows((prevRows) => [...prevRows, newRow]);
    setDropdownState((prevState) => [
      ...prevState,
      { subheaders: [], taxRate: [], filtered: [], loading: false },
    ]);
  };

  const deleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const updatedDropdownState = dropdownState.filter((_, i) => i !== index);

    dropdownRefs.current.splice(index, 1);
    setRows(updatedRows);
    setDropdownState(updatedDropdownState);
    onRowsChange(updatedRows);
  };

  const fetchSubheaders = async (header, rowIndex) => {
    try {
      setDropdownState((prev) => {
        const newState = [...prev];
        newState[rowIndex] = {
          ...newState[rowIndex],
          loading: true,
        };
        return newState;
      });

      const response = await fetch(
        `http://localhost:8000/getAccountsByType?type=${header}`,
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
        const fetchedSubheaders = {
          subheaders: data.accounts.map(
            (account) => `${account.code}-${account.name}`
          ),
          taxRates: data.accounts.map((account) => account.taxRate.toString()),
        };

        setDropdownState((prev) => {
          const newState = [...prev];
          newState[rowIndex] = {
            ...newState[rowIndex],
            subheaders: fetchedSubheaders.subheaders,
            taxRate: fetchedSubheaders.taxRates,
            filtered: fetchedSubheaders.subheaders,
            loading: false,
          };
          return newState;
        });
      } else {
        setDropdownState((prev) => {
          const newState = [...prev];
          newState[rowIndex] = {
            ...newState[rowIndex],
            subheaders: [],
            taxRate: [],
            filtered: [],
            loading: false,
          };
          return newState;
        });
      }
    } catch (error) {
      setDropdownState((prev) => {
        const newState = [...prev];
        newState[rowIndex] = {
          ...newState[rowIndex],
          loading: false,
        };
        return newState;
      });
      console.error("Error fetching subheaders:", error);
    }
  };

  const handleSearch = (index, value) => {
    setDropdownState((prev) => {
      const newState = [...prev];
      newState[index].filtered = value
        ? newState[index].subheaders.filter((sub) =>
            sub.toLowerCase().includes(value.toLowerCase())
          )
        : newState[index].subheaders;
      return newState;
    });
  };

  const toggleDropdown = (index, inputRef) => {
    if (visibleDropdownIndex === index) {
      setVisibleDropdownIndex(null);
    } else {
      const rect = inputRef.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left,
      });
      setVisibleDropdownIndex(index);
    }
  };

  const toggleDropdownHeader = (index, inputRef) => {
    if (visibleDropdownHeaderIndex === index) {
      setVisibleDropdownHeaderIndex(null);
    } else {
      const rect = inputRef.getBoundingClientRect();
      setDropdownHeaderPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left,
        width: rect.width,
      });
      setVisibleDropdownHeaderIndex(index);
    }
  };

  const handleMainAccountChange = (rowIndex, selectedHeader) => {
    const updatedRows = rows.map((row, index) =>
      index === rowIndex
        ? { ...row, header: selectedHeader, subheader: "", taxRate: "" }
        : row
    );

    setRows(updatedRows);
    onRowsChange(updatedRows);

    if (selectedHeader) {
      fetchSubheaders(selectedHeader, rowIndex);
    } else {
      setDropdownState((prev) => {
        const newState = [...prev];
        newState[rowIndex] = {
          subheaders: [],
          taxRate: [],
          filtered: [],
          loading: false,
        };
        return newState;
      });
    }
  };

  const handleSubheaderSelect = (rowIndex, selectedSubheader) => {
    const currentState = dropdownState[rowIndex];
    const taxRateIndex = currentState.subheaders.indexOf(selectedSubheader);
    const selectedTaxRate = currentState.taxRate[taxRateIndex] || "";

    const updatedRows = rows.map((row, index) =>
      index === rowIndex
        ? { ...row, subheader: selectedSubheader, taxRate: selectedTaxRate }
        : row
    );

    setRows(updatedRows);
    onRowsChange(updatedRows);
    setVisibleDropdownIndex(null);
  };

  const validateSubheaderInput = (rowIndex, value) => {
    const currentState = dropdownState[rowIndex];
    if (value && !currentState.subheaders.includes(value)) {
      const updatedRows = rows.map((row, index) =>
        index === rowIndex ? { ...row, subheader: "", taxRate: "" } : row
      );
      setRows(updatedRows);
      onRowsChange(updatedRows);
    }
  };

  const closeAddAccountForm = () => {
    setShowAddAccount(false);
  };

  const handleOutsideClick = (e, refs, setVisibleIndex) => {
    if (
      !refs.current.some((ref) => ref && ref.contains(e.target)) &&
      !e.target.closest(".dropdown-menu")
    ) {
      setVisibleIndex(null);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      handleOutsideClick(e, dropdownRefsHeader, setVisibleDropdownHeaderIndex);
      handleOutsideClick(e, dropdownRefs, setVisibleDropdownIndex);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="min-w-[900px]">
      <div className="w-full overflow-x-auto mb-1">
        <table className="w-full mt-0 table-fixed border-collapse border border-gray-300">
          <thead>
            <tr className="">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="p-3 border border-gray-300 text-center"
                  style={{ width: header.width || "auto" }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const currentDropdown = dropdownState[rowIndex] || {
                subheaders: [],
                taxRate: [],
                filtered: [],
                loading: false,
              };

              const hasSubheaders = currentDropdown.subheaders?.length > 0;
              const subheaderDisabled = !row.header || currentDropdown.loading;

              return (
                <tr key={rowIndex} className="h-auto">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="border border-gray-300">
                      {header.field ? (
                        header.field === "header" ? (
                          <div
                            ref={(ref) =>
                              (dropdownRefsHeader.current[rowIndex] = ref)
                            }
                            className="relative"
                          >
                            <div
                              onClick={() =>
                                toggleDropdownHeader(
                                  rowIndex,
                                  dropdownRefsHeader.current[rowIndex]
                                )
                              }
                              className="cursor-pointer px-2 w-full h-14 flex items-center justify-between bg-white rounded focus:outline-blue-500"
                            >
                              <span>{row.header || "Select a Header"}</span>
                              <FaAngleDown />
                            </div>

                            {visibleDropdownHeaderIndex === rowIndex &&
                              createPortal(
                                <ul
                                  style={{
                                    position: "absolute",
                                    top: `${dropdownHeaderPosition.top}px`,
                                    left: `${dropdownHeaderPosition.left}px`,
                                    width: `${dropdownHeaderPosition.width}px`,
                                    backgroundColor: "white",
                                    border: "1px solid #ccc",
                                    zIndex: 1000,
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                  className="dropdown-menu absolute z-10 w-[215px] mt-1"
                                >
                                  {accountType.map((type, i) => (
                                    <div key={i}>
                                      <li className="px-3 py-1 font-bold text-primary">
                                        {type.name}
                                      </li>
                                      {type.subheaders.map((sub, index) => (
                                        <li
                                          key={index}
                                          onClick={() => {
                                            handleMainAccountChange(
                                              rowIndex,
                                              sub
                                            );
                                            setVisibleDropdownHeaderIndex(null);
                                          }}
                                          className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                                        >
                                          {sub}
                                        </li>
                                      ))}
                                    </div>
                                  ))}
                                </ul>,
                                document.body
                              )}
                          </div>
                        ) : header.field === "subheader" ? (
                          <div
                            ref={(ref) =>
                              (dropdownRefs.current[rowIndex] = ref)
                            }
                            className="relative"
                          >
                            <input
                              type="text"
                              name="subheader"
                              value={row.subheader || ""}
                              onChange={(e) => {
                                handleRowChange(rowIndex, e);
                                handleSearch(rowIndex, e.target.value);
                              }}
                              onBlur={(e) => {
                                validateSubheaderInput(
                                  rowIndex,
                                  e.target.value
                                );
                              }}
                              onFocus={() => {
                                if (row.header && !currentDropdown.loading) {
                                  toggleDropdown(
                                    rowIndex,
                                    dropdownRefs.current[rowIndex]
                                  );
                                }
                              }}
                              className={`w-full h-14 px-2 bg-transparent border-none focus:outline-blue-500 rounded-none ${
                                subheaderDisabled ? "bg-gray-100" : ""
                              }`}
                              placeholder={
                                currentDropdown.loading
                                  ? "Loading..."
                                  : !row.header
                                  ? "Select header first"
                                  : !hasSubheaders
                                  ? "No options available"
                                  : "Type to search..."
                              }
                              disabled={subheaderDisabled}
                            />

                            {!currentDropdown.loading && row.header && (
                              <button
                                onClick={() =>
                                  toggleDropdown(
                                    rowIndex,
                                    dropdownRefs.current[rowIndex]
                                  )
                                }
                                className="absolute top-3 right-3 text-gray-500"
                                disabled={!hasSubheaders}
                              >
                                <FaAngleDown />
                              </button>
                            )}

                            {visibleDropdownIndex === rowIndex &&
                              createPortal(
                                <ul
                                  className="dropdown-menu absolute z-10 w-[215px] mt-1"
                                  style={{
                                    position: "absolute",
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    backgroundColor: "white",
                                    border: "1px solid #ccc",
                                    zIndex: 1000,
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <li>
                                    <button
                                      className="w-full px-4 py-2 flex items-center gap-x-2 text-blue-500 hover:bg-blue-100"
                                      onClick={() => {
                                        setShowAddAccount(true);
                                        setVisibleDropdownIndex(null);
                                      }}
                                    >
                                      <IoMdAddCircle className="text-xl" />
                                      <span>Add New Account</span>
                                    </button>
                                  </li>
                                  {currentDropdown.filtered.length > 0 ? (
                                    currentDropdown.filtered.map(
                                      (sub, index) => (
                                        <li
                                          key={index}
                                          className="p-2 hover:hover:bg-blue-100 cursor-pointer"
                                          onClick={() =>
                                            handleSubheaderSelect(rowIndex, sub)
                                          }
                                        >
                                          {sub}
                                        </li>
                                      )
                                    )
                                  ) : (
                                    <li className="p-2 text-gray-500">
                                      {hasSubheaders
                                        ? "No matching options"
                                        : "No options available"}
                                    </li>
                                  )}
                                </ul>,
                                document.body
                              )}
                          </div>
                        ) : header.field === "taxRate" ? (
                          <input
                            type="text"
                            name="taxRate"
                            value={row.taxRate ? `${row.taxRate}%` : ""}
                            readOnly
                            className="w-full h-14 px-2 bg-transparent border-none rounded-none"
                          />
                        ) : (
                          <input
                            type={header.type || "text"}
                            name={header.field}
                            value={row[header.field] || ""}
                            onChange={(e) => handleRowChange(rowIndex, e)}
                            className="w-full h-14 px-2 bg-transparent border-none focus:outline-blue-500 rounded-none"
                          />
                        )
                      ) : header.action === "delete" ? (
                        rows.length > 1 && (
                          <button
                            onClick={() => deleteRow(rowIndex)}
                            className="px-2 text-red-500"
                          >
                            ✕
                          </button>
                        )
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex w-full items-center justify-between">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add a new line
        </button>
      </div>

      {showAddAccount && (
        <DialogBox
          title="Add Account"
          description=""
          isVisible={showAddAccount}
          onClose={() => setShowAddAccount(false)}
        >
          <AddAccount onAddAccount={closeAddAccountForm} />
        </DialogBox>
      )}
    </div>
  );
};

export default DataTable;
