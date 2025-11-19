import React, { useEffect, useState } from "react";

const NewLineTable = ({
  headers = [],
  initialRows = [],
  onRowsChange = () => {},
}) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (initialRows.length > 0) {
      setRows(initialRows);
    } else {
      setRows([{}, {}, {}]);
    }
  }, [initialRows]);
  console.log("initialRows", initialRows);
  console.log("rows", rows);

  // Handle row input changes
  const handleRowChange = (index, e) => {
    const { name, value } = e.target;

    // Update the row with the new value
    const updatedRows = rows.map((row, rowIndex) => {
      if (rowIndex === index) {
        const updatedRow = { ...row, [name]: value };

        // Recalculate amount if qty or unitPrice changes
        if (name === "qty" || name === "unitPrice") {
          const qty = parseFloat(updatedRow.qty) || 0;
          const unitPrice = parseFloat(updatedRow.unitPrice) || 0;
          updatedRow.amount = qty * unitPrice;
        }

        return updatedRow;
      }
      return row;
    });

    setRows(updatedRows);
    onRowsChange(updatedRows);
  };

  // Add a new row with empty values based on headers
  const addRow = () => {
    const newRow = headers.reduce((acc, header) => {
      if (header.field) {
        acc[header.field] = "";
      }
      return acc;
    }, {});
    newRow.amount = 0;
    setRows([...rows, newRow]);
  };

  // Delete a row
  const deleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    onRowsChange(updatedRows); // Send updated rows back to the parent
  };

  return (
    <div>
      <div className="w-full overflow-x-auto mb-1">
        <table className="w-full mt-0 table-fixed border-collapse border border-gray-300">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`p-3 border border-gray-300 text-center ${
                    header.action === "delete" ? "w-8 text-center" : ""
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="h-auto">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="border border-gray-300">
                    {header.field ? (
                      <input
                        type={header.type || "text"}
                        name={header.field}
                        value={row[header.field] || ""}
                        onChange={(e) => handleRowChange(rowIndex, e)}
                        className="w-full h-14 px-2 bg-transparent border-none focus:outline-blue-500 rounded-none"
                      />
                    ) : header.action === "delete" ? (
                      rows.length > 1 && (
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="px-2 text-red-500"
                        >
                          ✕
                        </button>
                      )
                    ) : (
                      <span>{header.staticValue || ""}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
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
    </div>
  );
};

export default NewLineTable;
