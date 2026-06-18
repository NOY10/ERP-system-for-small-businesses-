import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import useCompanyStore from "../../../../store/useCompanyStore";

const InvoiceCard2 = () => {
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

  const [Data] = useState({
    company: {
      name: "NexrTech",
      logo: "https://bcassetcdn.com/public/blog/wp-content/uploads/2021/10/07204938/tech-maze-by-simplepixelsl-brandcrowd.png",
      address: "Thimphu, Bhutan",
      phone: "+975 17777778",
      email: "info@nexrTech.com",
    },
    client: {
      company: "BOB",
      address: "Phuentsholing",
      email: "client@industries.com",
      phone: "77778998",
    },
  });

  const subtotal = invoiceData.invoiceItems.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src={companyInfo.logo}
              alt="Company Logo"
              className="w-16 h-16 object-contain mr-4"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&h=120";
              }}
            />
            <div>
              <h1 className="text-2xl font-heading text-foreground">
                {invoiceData.owner || ""}
              </h1>
              <p className="text-normal">{invoiceData.title || ""}</p>
            </div>
          </div>
        </div>

        {/* Company & Client Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-heading text-foreground mb-3">From:</h2>
            <div className="text-normal">
              <p>{companyInfo.name}</p>
              <p>{companyInfo.address}</p>
              <p>{companyInfo.email}</p>
              <p>{companyInfo.phone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-heading text-foreground mb-3">
              Bill To:
            </h2>
            <div className="text-normal">
              <p className="font-semibInvoicePDF">{Data.client.name}</p>
              <p>{invoiceData.to || ""}</p>
              <p>{Data.client.address}</p>
              <p>{Data.client.email}</p>
              <p>{Data.client.phone}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-navBg text-secondary-foreground">
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.invoiceItems.map((item, index) => (
                <tr key={index} className="border-b border-border">
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

          <div className="mt-4 ml-auto w-64">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Tax (10%):</span>
              <span>{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-heading text-lg">
              <span>Total:</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-8">
          <h2 className="text-lg font-heading text-foreground mb-3">
            Payment Terms
          </h2>
          <div className="bg-muted p-4 rounded-md text-muted-foreground">
            <p>Due Date: {invoiceData.dueDate}</p>
            <p>
              Please make payment via bank transfer or credit card within 30
              days.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-normal text-sm">
          <p className="mb-2">Thank you for your business!</p>
          <p>
            This invoice was generated electronically and is valid without a
            signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard2;
