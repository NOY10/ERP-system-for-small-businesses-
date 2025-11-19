import React from "react";
import { useNavigate } from "react-router-dom";
import JournalList from "./JournalList";
import { FaPlusCircle } from "react-icons/fa";
import { CiImport } from "react-icons/ci";

function ManualJournal() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-4 bg-white shadow rounded-lg h-[70px]">
        <div>
          <span className="text-gray-700 font-semibold text-lg">
            Manual Journal
          </span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <button
            onClick={() => navigate("/ManualJournal/Add")}
            className="flex items-center justify-center gap-x-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm ml-auto"
          >
            <FaPlusCircle className="text-white text-[18px]" />
            <p className="text-sm">Journal</p>
          </button>
          <button
            onClick={() => navigate("/ManualJournal/ImportJournal")}
            className="flex items-center justify-center gap-x-2 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-sm  ml-auto"
          >
            <CiImport className="text-white text-[20px]" />
            <p className="text-sm">Import</p>
          </button>
        </div>
      </div>
      <div>
        <JournalList />
      </div>
    </div>
  );
}

export default ManualJournal;
