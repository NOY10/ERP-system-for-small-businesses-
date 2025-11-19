import { Button } from "@mui/material";
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";

function VIewCompanyInfo({ company, setSubmitted, setEdit }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Company Information
        </h1>

        <Button
          onClick={() => {
            setSubmitted(false);
            setEdit(true);
          }}
          variant="contained"
          color="warning"
          startIcon={<FaEdit />}
        >
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {[
            { label: "Company Name", value: company.name },
            { label: "Established Date", value: company.established },
            { label: "Registration No", value: company.regNo },
            { label: "bankName", value: company.bankName },
            { label: "Address", value: company.address },
            { label: "Dzongkhag", value: company.dzongkhag },
            { label: "Phone", value: company.phone },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <h3 className="text-sm font-medium text-gray-500">
                {item.label}
              </h3>
              <p className="mt-1 text-lg text-gray-900">{item.value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Company Email</h3>
            <p className="mt-1 text-lg text-gray-900">{company.email}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Company Website
            </h3>
            <p className="mt-1 text-lg text-gray-900">{company.website}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Fiscal Year</h3>
            <p className="mt-1 text-lg text-gray-900">{company.fiscalYear}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Account Number
            </h3>
            <p className="mt-1 text-lg text-gray-900">{company.accountNo}</p>
          </div>

          {company.logo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">
                Company Logo
              </h3>
              <div className="mt-2 w-[225px] h-[225px] bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={company?.logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setShowPreview(true)}
                />
                {showPreview && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative">
                      <button
                        className="absolute -top-[30px] right-[5px] text-white text-2xl"
                        onClick={() => setShowPreview(false)}
                      >
                        <IoIosCloseCircleOutline className="text-3xl" />
                      </button>
                      <img
                        src={company?.logo}
                        alt="Full Screen"
                        className="max-w-full max-h-full rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VIewCompanyInfo;
