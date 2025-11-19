import React from "react";
import Tooltip from "../../../../Components/Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

function ReportCard() {
  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
        <h4 className="text-base md:text-lg font-medium text-gray-700">
          Reports
        </h4>
        <Tooltip
          tooltip="Reports relating profits, losses, and financial reporting for your business."
          position="bottom"
        >
          <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
        </Tooltip>
      </div>

      <div className="p-2">
        <div className="px-4 py-3">
          <ul className="space-y-2">
            <li>
              <a
                href="/Reports/ProfitandLoss"
                className="text-primary hover:underline"
              >
                Profit and Loss
              </a>
            </li>
            <li>
              <a
                href="/Reports/CashFlowStatement"
                className="text-primary hover:underline"
              >
                Cash Flow Statement
              </a>
            </li>
            <li>
              <a
                href="/Reports/BalanceSheet"
                className="text-primary hover:underline"
              >
                Balance Sheet
              </a>
            </li>
            <li>
              <a
                href="/Reports/TrialBalance"
                className="text-primary hover:underline"
              >
                Trial Balance
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReportCard;
