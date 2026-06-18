import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogBox from "../../../../Components/Dialogbox";
import useBankStore from "../../../../contexts/bankStore";
import useAuthStore from "../../../../store/useAuthStore";

import { API_BASE_URL } from "../../../../config/api";

function AddBank() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const setBankDetails = useBankStore((state) => state.setBankDetails);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountName || !accountNumber) {
      alert("Please fill in all the fields.");
      return;
    }

    if (accountNumber.length !== 12) {
      alert("Account number must be exactly 12 digits.");
      return;
    }
    // Open the dialog box after successful submission
    setDialogVisible(true);
  };

  const handleDialogSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start date and an end date.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be later than the end date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/addBankDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountname: accountName,
          accountnumber: String(accountNumber),
          startdate: startDate,
          enddate: endDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBankDetails({
          accountName: accountName,
          accountNumber: accountNumber,
          startdate: startDate,
          enddate: endDate,
        });
      } else {
        const errorMsg =
          data?.error || data?.message || "Failed to add bank details.";
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Error submitting bank details:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }

    alert(`Bank feeds will be fetched from: ${startDate} to ${endDate}`);
    setDialogVisible(false);
    navigate("/Banking");
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-4 bg-white shadow rounded-lg h-[70px]">
        <span className="text-gray-700 font-semibold text-lg">Add Account</span>
      </div>

      <div className="flex justify-center items-center mt-4 md:mt-20">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold text-center mb-6">
            Enter your DK Bank account details
          </h2>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-4">
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="accountName"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Account Name
              </label>
              <input
                type="text"
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Account Number
              </label>
              <input
                type="number"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                className="p-2 border border-primary text-primary hover:bg-[#F5F5F5] rounded"
                onClick={() => navigate("/Banking")}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 focus:outline-none"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DialogBox
        title="Fetch Bank Feeds"
        discription="Select a date range for fetching your bank statement."
        isVisible={dialogVisible}
        onClose={() => setDialogVisible(false)} // Closes the dialog without action
        onSubmit={handleDialogSubmit} // Triggers submission logic
        confirmText="Fetch"
        cancelText="Cancel"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]} // Disables future dates
              className="w-full p-2 border rounded-md focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]} // Disables future dates
              className="w-full p-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>
      </DialogBox>
    </div>
  );
}

export default AddBank;
