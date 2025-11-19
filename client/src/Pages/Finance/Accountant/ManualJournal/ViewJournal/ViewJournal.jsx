import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../../../../store/useAuthStore";
import { Button, Menu, MenuItem } from "@mui/material";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const getAccountType = (mainAccount) => {
  for (const account of accountType) {
    if (account.subheaders.includes(mainAccount)) {
      return account.name;
    }
  }
  return null;
};

const ViewJournal = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const processJournalLines = (income, expense) => {
    const journalLines = income.concat(expense).map((row) => {
      const { amount } = row;
      const parentAccount = getAccountType(row.header);

      let debit = 0;
      let credit = 0;

      switch (parentAccount) {
        case "Assets":
          expense.includes(row) ? (debit = amount) : (credit = amount);
          break;
        case "Liabilities":
          income.includes(row) ? (credit = amount) : (debit = amount);
          break;
        case "Expenses":
          debit = amount;
          break;
        case "Revenue/Income":
          credit = amount;
          break;
        default:
          console.warn(`Unhandled parentAccount: ${parentAccount}`);
      }

      return {
        ...row,
        debit,
        credit,
      };
    });

    return journalLines;
  };

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/getByJournalID", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            journalID: id,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch Journal");

        const responseData = await response.json();
        const journalLines = processJournalLines(
          responseData.income,
          responseData.expense
        );

        const totalDebit = journalLines.reduce(
          (sum, line) => sum + line.debit,
          0
        );
        const totalCredit = journalLines.reduce(
          (sum, line) => sum + line.credit,
          0
        );

        setJournal({
          ...responseData,
          journalLines,
          totalDebit,
          totalCredit,
        });
      } catch (error) {
        console.error("Error fetching journal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id, token]);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportAsCSV = () => {
    if (!journal) return;

    const headers = [
      "Description",
      "Account Type",
      "Account",
      "Tax Rate",
      "Debit(Nu)",
      "Credit(Nu)",
    ];
    const rows = journal.journalLines.map((line) => [
      `"${line.description}"`,
      line.header,
      line.subheader,
      line.taxRate,
      line.debit.toFixed(2),
      line.credit.toFixed(2),
    ]);

    const totalsRow = [
      "",
      "",
      "",
      "TOTAL",
      journal.totalDebit.toFixed(2),
      journal.totalCredit.toFixed(2),
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
      totalsRow.join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // saveAs(blob, `journal_${id}_${new Date().toISOString().slice(0, 10)}.csv`);
    saveAs(blob, `${journal.narration}.csv`);
  };

  const exportAsPDF = () => {
    if (!journal) return;

    const doc = new jsPDF();

    // Title and metadata
    doc.setFontSize(16);
    doc.text(`Journal Entry - ${journal.date}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Narration: ${journal.narration}`, 14, 22);
    // doc.text(`Journal ID: ${id}`, 14, 29);

    // Table data
    const headers = [
      "Description",
      "Account Type",
      "Account",
      "Tax Rate",
      { content: "Debit(Nu)", styles: { halign: "right" } },
      { content: "Credit(Nu)", styles: { halign: "right" } },
    ];

    const data = journal.journalLines.map((line) => [
      line.description,
      line.header,
      line.subheader,
      line.taxRate,
      { content: line.debit.toFixed(2), styles: { halign: "right" } },
      { content: line.credit.toFixed(2), styles: { halign: "right" } },
    ]);

    // Add totals row
    data.push([
      {
        content: "TOTAL",
        colSpan: 4,
        styles: { fontStyle: "bold", halign: "right" },
      },
      {
        content: journal.totalDebit.toFixed(2),
        styles: { fontStyle: "bold", halign: "right" },
      },
      {
        content: journal.totalCredit.toFixed(2),
        styles: { fontStyle: "bold", halign: "right" },
      },
    ]);

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10 },
    });

    // doc.save(`journal_${id}_${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.save(`${journal.narration}.pdf`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!journal) return <div className="p-4">Journal not found</div>;

  const { date, narration, journalLines, totalDebit, totalCredit } = journal;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
        <h1 className="text-xl font-semibold">Journal Details</h1>

        <div>
          <Button
            variant="contained"
            onClick={handleExportClick}
            startIcon={
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
            style={{ textTransform: "none" }}
          >
            Export
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                exportAsCSV();
                handleClose();
              }}
            >
              Download as CSV
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportAsPDF();
                handleClose();
              }}
            >
              Download as PDF
            </MenuItem>
          </Menu>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium">Narration</h2>
            <p className="text-gray-700">{narration}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium">Date</h2>
            <p className="text-gray-700">{date}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left border">Description</th>
                <th className="px-4 py-3 text-left border">Account Type</th>
                <th className="px-4 py-3 text-left border">Account</th>
                <th className="px-4 py-3 text-left border">Tax Rate</th>
                <th className="px-4 py-3 text-right border">Debit(Nu)</th>
                <th className="px-4 py-3 text-right border">Credit(Nu)</th>
              </tr>
            </thead>
            <tbody>
              {journalLines.map((line, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 border">{line.description}</td>
                  <td className="px-4 py-3 border">{line.header}</td>
                  <td className="px-4 py-3 border">{line.subheader}</td>
                  <td className="px-4 py-3 border">{line.taxRate}</td>
                  <td className="px-4 py-3 text-right border">
                    {line.debit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right border">
                    {line.credit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-right border">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-right border">
                  {totalDebit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right border">
                  {totalCredit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            style={{ textTransform: "none" }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              navigate(`/ManualJournal/Edit/${id}`, { state: { journal } })
            }
            style={{ textTransform: "none" }}
          >
            Edit Journal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewJournal;
