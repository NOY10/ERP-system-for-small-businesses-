import { Button } from "@mui/material";
import React from "react";
import { FaSave } from "react-icons/fa";
import CompanyLogo from "./CompanyLogo";

function AddCompanyInfo({
  company,
  handleSubmit,
  handleChange,
  setSubmitted,
  setPreviewImage,
  setProfileImage,
  previewImage,
}) {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {[
              {
                id: "name",
                label: "Company Name",
                type: "text",
                placeholder: "Enter company name",
              },
              {
                id: "established",
                label: "Established Date",
                type: "date",
              },
              {
                id: "regNo",
                label: "Registration No",
                type: "text",
                placeholder: "Enter registration number",
              },
              {
                id: "bankName",
                label: "Bank Name",
                type: "text",
                placeholder: "Enter Bank Name",
              },
              {
                id: "address",
                label: "Address",
                type: "text",
                placeholder: "Enter company address",
              },
              {
                id: "dzongkhag",
                label: "Dzongkhag",
                type: "text",
                placeholder: "Enter Dzongkhag",
              },
              {
                id: "phone",
                label: "Phone",
                type: "text",
                placeholder: "Enter phone number",
              },
            ].map((field) => (
              <div
                key={field.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-500 mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  value={company[field.id] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Company Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={company.email || ""}
                onChange={handleChange}
                placeholder="Enter company email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Company Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                value={company.website || ""}
                onChange={handleChange}
                placeholder="Enter website URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <label
                htmlFor="fiscalYear"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Fiscal Year
              </label>
              <input
                id="fiscalYear"
                name="fiscalYear"
                type="text"
                value={company.fiscalYear || ""}
                onChange={handleChange}
                placeholder="Enter fiscal year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <label
                htmlFor="accountNo"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Account Number
              </label>

              <input
                id="accountNo"
                name="accountNo"
                type="text"
                value={company.accountNo || ""}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <label
                htmlFor="logo"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Company Logo
              </label>

              <CompanyLogo
                setPreviewImage={setPreviewImage}
                setProfileImage={setProfileImage}
                previewImage={previewImage}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<FaSave />}
          >
            Save
          </Button>

          <Button
            onClick={() => setSubmitted(true)}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}

export default AddCompanyInfo;
