import React from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from "../../../../Components/Tooltip";
import useBankStore from "../../../../contexts/bankStore";
import { IoMdInformationCircleOutline } from "react-icons/io";

function BankCard() {
  const navigate = useNavigate();
  const { accountNumber } = useBankStore((state) => state.bankDetails);
  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
        <h4 className="text-base md:text-lg font-medium text-gray-700">
          Bank Account
        </h4>
        <Tooltip
          tooltip="Set up an automated bank feed using your online banking details for a single and up-to-date view of your transactions."
          position="bottom"
        >
          <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
        </Tooltip>
      </div>

      {accountNumber ? (
        <div className="py-2 px-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Business bank account</h2>
              <p className="text-gray-500 text-sm">{accountNumber}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <button
              className=" px-4 py-2   bg-primary text-white rounded-lg hover:bg-blue-600"
              onClick={() => navigate("/Banking")}
            >
              Reconcile 17 items
            </button>
            <div>
              <p className="text-gray-600 text-sm">Balance in Drukbooks</p>
              <p className="text-sm font-medium text-gray-800">0.00</p>
              <p className="text-gray-600 text-sm">Statement balance</p>
              <p className="text-sm font-medium text-gray-800">0.00</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 px-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Business bank account</h2>
              <p className="text-gray-500 text-sm">xxx-xxx-xxx</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <button
              className=" px-4 py-2   bg-primary text-white rounded-lg hover:bg-blue-600"
              onClick={() => navigate("/Banking/AddAccount")}
            >
              Securely connect a bank account
            </button>
            <div>
              <p className="text-gray-600 text-sm">Balance in Drukbooks</p>
              <p className="text-sm font-medium text-gray-800">0.00</p>
              <p className="text-gray-600 text-sm">Statement balance</p>
              <p className="text-sm font-medium text-gray-800">0.00</p>
            </div>
          </div>
        </div>
      )}

      {/* <div className="bg-red-100 h-40 rounded-lg relative">

        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500">
          Graph Placeholder
        </p>
      </div> */}
    </div>
  );
}

export default BankCard;
