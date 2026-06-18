import React from "react";
import BankStatement from "./BankStatement";

function Reconcilemain() {
  const bankData = [
    {
      transactionDate: "2024-12-04",
      agencyName: "SMART Agency",
      accountNumber: "01950210",
      transactionType: "EFT",
      spent: 4500.0,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-01",
      agencyName: "Tech Solutions Inc.",
      accountNumber: "98765432",
      transactionType: "Wire Transfer",
      spent: 3200.5,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-03",
      agencyName: "Global Supplies Co.",
      accountNumber: "12345678",
      transactionType: "Credit",
      spent: 0.0,
      received: 1500.0,
    },
    {
      transactionDate: "2024-12-05",
      agencyName: "Build Masters Ltd.",
      accountNumber: "45612378",
      transactionType: "EFT",
      spent: 2500.75,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-06",
      agencyName: "Retail World",
      accountNumber: "11223344",
      transactionType: "Debit Card",
      spent: 875.0,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-07",
      agencyName: "Green Energy Corp.",
      accountNumber: "33445566",
      transactionType: "Bank Transfer",
      spent: 0.0,
      received: 2100.0,
    },
    {
      transactionDate: "2024-12-08",
      agencyName: "Media Pros",
      accountNumber: "77889900",
      transactionType: "EFT",
      spent: 5200.0,
      received: 0.0,
    },
  ];

  const transaction = [
    {
      transactionDate: "2024-12-04",
      agencyName: "SMART Agency",
      accountNumber: "01950210",
      transactionType: "EFT",
      spent: 4500.0,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-01",
      agencyName: "Tech Solutions Inc.",
      accountNumber: "98765432",
      transactionType: "Wire Transfer",
      spent: 3200.5,
      received: 0.0,
    },
    {
      transactionDate: "2025-12-03",
      agencyName: "Global Supplies Co.",
      accountNumber: "12345678",
      transactionType: "Credit",
      spent: 0.0,
      received: 1500.0,
    },
    {
      transactionDate: "2024-12-05",
      agencyName: "Build Masters Ltd.",
      accountNumber: "45612378",
      transactionType: "EFT",
      spent: 2500.75,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-06",
      agencyName: "Retail World",
      accountNumber: "11223344",
      transactionType: "Debit Card",
      spent: 875.0,
      received: 0.0,
    },
    {
      transactionDate: "2024-12-07",
      agencyName: "Green Energy Corp.",
      accountNumber: "33445566",
      transactionType: "Bank Transfer",
      spent: 0.0,
      received: 2100.0,
    },
    {
      transactionDate: "2022-12-08",
      agencyName: "Media Pros",
      accountNumber: "77889900",
      transactionType: "EFT",
      spent: 5200.0,
      received: 0.0,
    },
  ];
  return (
    <div className="flex-1  flex gap-x-4 justify-between">
      <div className="flex-1">
        <div className="flex">
          <h2 className="flex-1 w-1/2 border-b border-gray-500 mb-1 mr-6">
            Bank Statement
          </h2>
          <h2 className="flex-1  border-b border-gray-500 mb-1 ml-12">
            Drukbook Statement
          </h2>
        </div>
        {bankData.map((data) => (
          <BankStatement
            date={data.transactionDate}
            name={data.agencyName}
            accountNumber={data.accountNumber}
            transactionType={data.transactionType}
            spent={data.spent}
            received={data.received}
            transactionData={transaction}
          />
        ))}
      </div>
    </div>
  );
}

export default Reconcilemain;
