import React, { useState, useRef } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import useCompanyStore from "../../../../store/useCompanyStore";

const InvoiceCard3 = () => {
  const printRef = useRef(null);
  const location = useLocation();
  const { companyInfo } = useCompanyStore();
  const [invoiceData] = useState(
    location.state?.PDFData || {
      owner: "",
      title: "",
      to: "",
      dueDate: "",
      invoiceItems: [],
    }
  );

  console.log("InvoiceCard3", invoiceData);
  const Card1Data = {
    company: {
      name: "NexrTech Comapany",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
      address: "Thimphu, Bhutan",
      phone: "+975 17777778",
      email: "info@nexrTech.com",
    },

    recipient: {
      company: "Client Industries Ltd.",
      email: "client@industries.com",
      phone: "77778998",
    },
  };

  const subtotal = invoiceData.invoiceItems.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // handlePrint
  // const handlePrint = async () => {
  //   const element = printRef.current;

  //   if (!element) {
  //     console.error("Element not found for printing.");
  //     return;
  //   }

  //   try {
  //     // Generate canvas from the element
  //     const canvas = await html2canvas(element, { scale: 3 });
  //     const data = canvas.toDataURL("image/png");

  //     // Initialize jsPDF
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "px",
  //       format: "a4",
  //     });

  //     // Get PDF dimensions
  //     const pdfWidth = pdf.internal.pageSize.width;
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  //     pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
  //     pdf.save("invoice.pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };
  const handlePrint = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      // Try with CORS first
      try {
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
        });
        return generatePDF(canvas);
      } catch (corsError) {
        console.log("CORS approach failed, trying fallback");
      }

      // Fallback: Convert image to data URL
      const clone = element.cloneNode(true);
      const logo = clone.querySelector("img");
      if (logo) {
        const response = await fetch(logo.src);
        const blob = await response.blob();
        logo.src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      document.body.appendChild(clone);
      clone.style.visibility = "hidden";

      const canvas = await html2canvas(clone, { scale: 3 });
      document.body.removeChild(clone);

      generatePDF(canvas);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const generatePDF = (canvas) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          variant="contained"
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2 shadow transition w-full md:w-auto"
          style={{ textTransform: "none" }}
        >
          <svg
            className="h-5 w-5 text-white inline-block mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>
      <div ref={printRef} className="w-full p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className="w-16 h-16 object-contain mr-4"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1633409361618-c73427e4e206";
              }}
            />
            <div>
              <h1 className="text-heading font-heading text-foreground">
                {companyInfo.name}
              </h1>
              <div className="flex flex-col  text-body">
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt /> {companyInfo.address}
                </span>
                <span className="flex items-center gap-2">
                  <FaPhone /> {companyInfo.phone}
                </span>
                <span className="flex items-center gap-2">
                  <FaEnvelope /> {companyInfo.email}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div>
              <p>
                <span className="font-semibold">Invoice #:</span>{" "}
                {invoiceData.title || ""}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {invoiceData.date || ""}
              </p>
              <p>
                <span className="font-semibold">Due Date:</span>{" "}
                {invoiceData.dueDate || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Bill To:</h3>
          <div>
            <p className="font-semibold text-lg">{invoiceData.to || ""}</p>
            <p>{Card1Data.recipient.company}</p>
            <p>{Card1Data.recipient.address}</p>
            <p>{Card1Data.recipient.email}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-navBg text-foreground">
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.invoiceItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-primary/5 transition-colors"
                >
                  <td className="py-3 px-4">{item.item}</td>
                  <td className="py-3 px-4 text-right">{item.qty}</td>
                  <td className="py-3 px-4 text-right">
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-semibold">Subtotal:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Tax (10%):</span>
              <span>{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-primary">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg text-primary">
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-border pt-6">
          <div className="mb-4">
            <h4 className="font-bold mb-2">Payment Terms:</h4>
            <p>Please make payment within 30 days to the following account:</p>
            <p>Bank: Digital Kidu</p>
            <p>Account: 122656705</p>
            <p>Account Holder: Phurpa Tshering</p>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex justify-between">
              <div className="w-48">
                <div className="border-t-2 border-foreground pt-2">
                  <p className="text-center text-sm">Authorized Signature</p>
                </div>
              </div>
              <div className="w-48">
                <div className="border-t-2 border-foreground pt-2">
                  <p className="text-center text-sm">Client Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard3;
