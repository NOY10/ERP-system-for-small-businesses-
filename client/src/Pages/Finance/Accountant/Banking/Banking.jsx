import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBankStore from "../../../../contexts/bankStore";
import DKIMG from "./icons/DK.png";
import BankLayout from "./BankLayout";
import useAuthStore from "../../../../store/useAuthStore";

function Banking() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const setBankDetails = useBankStore((state) => state.setBankDetails);

  const { accountNumber, accountName, startdate, enddate } = useBankStore(
    (state) => state.bankDetails
  );

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        if (!accountNumber || !accountName) {
          const response = await fetch("http://localhost:8000/getBankDetails", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch bank details");
          }

          const data = await response.json();

          if (data.bankDetails && data.bankDetails.length > 0) {
            const { accountname, accountnumber, startdate, enddate } =
              data.bankDetails[0];
            setBankDetails({
              accountName: accountname,
              accountNumber: accountnumber,
              startdate: startdate,
              enddate: enddate,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching bank details: ", error);
      }
    };

    fetchBankDetails();
  }, [accountNumber, accountName, token, setBankDetails]);

  return (
    <div>
      <div className="flex items-center justify-between p-4 mb-4 bg-white shadow rounded-lg h-[80px]">
        <div>
          <span className="text-gray-700 font-semibold text-xl">
            Bank Accounts
          </span>
        </div>
      </div>

      {
        (accountNumber,
        accountName ? (
          <div className="border">
            <div className="py-4 px-6 border flex flex-col md:flex-row items-start md:items-center">
              <div className="flex-1 flex-col">
                <div className="flex gap-x-2">
                  <p className="font-semibold text-black">Account Name:</p>
                  <p className="text-gray-800">{accountName}</p>
                </div>
                <div className="flex gap-x-2 items-center">
                  <p className="font-semibold text-black">Account Number:</p>
                  <p className="text-gray-800">{accountNumber}</p>
                  <div className="relative group">
                    <img
                      src={DKIMG}
                      alt="DKLOGO"
                      className="h-5 w-5 rounded-sm"
                    />
                    <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded-md transition-opacity duration-300 pointer-events-none">
                      Connected to DK
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex-1 mt-4 md:mt-2">
                <p className="text-gray-500 text-sm uppercase tracking-wide">
                  Bank Statement
                </p>
                <p className="text-gray-700 font-medium">
                  {startdate} <span className="text-gray-500">to</span>{" "}
                  {enddate}
                </p>
              </div>
            </div>

            <div className="flex items-center bg-white p-6 gap-x-5">
              {/* Statement Balance */}
              <div>
                <h2 className="text-2xl font-semibold">8,315.64</h2>
                <p className="text-gray-500 text-sm">Statement Balance</p>
              </div>

              {/* Balance in Xero */}
              <div className="text-right">
                <h2 className="text-2xl font-semibold">3,387.04</h2>
                <p className="text-gray-500 text-sm">Balance in Drukbook</p>
              </div>
            </div>
            <BankLayout />
          </div>
        ) : (
          // Display message if no account number is present
          <>
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded mb-4">
              <p>
                <strong>Info:</strong> You currently have no bank accounts.
              </p>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => navigate("/Banking/AddAccount")}
                className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 focus:outline-none"
              >
                + Add Bank Account
              </button>
            </div>
          </>
        ))
      }
    </div>
  );
}

export default Banking;
