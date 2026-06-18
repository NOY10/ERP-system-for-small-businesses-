// import React, { useState } from "react";
// import InvoiceCard2 from "./InvoicePDF2";
// import InvoiceCard3 from "./InvoicePDF3";
// import Card3 from "./Card3";

// const InvoicePDF = () => {
//   const cards = [
//     {
//       id: 1,
//       component: <InvoiceCard2 />,
//       preview: {
//         title: "Preview 1",
//       },
//     },
//     {
//       id: 2,
//       component: <InvoiceCard3 />,
//       preview: {
//         title: "Preview 2",
//       },
//     },
//     {
//       id: 3,
//       component: <Card3 />,
//       preview: {
//         title: "Preview 3",
//       },
//     },
//   ];

//   // Set InvoiceCard2 as the default selected card
//   const [selectedCard, setSelectedCard] = useState(cards[0]);

//   return (
//     <div className="flex flex-col lg:flex-row gap-4 p-4">
//       {/* Mini Card Previews */}
//       <div className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 overflow-x-auto lg:overflow-y-auto w-full lg:w-1/4 bg-gray-50 rounded-lg shadow-md p-4">
//         {cards.map((card) => (
//           <div
//             key={card.id}
//             onClick={() => setSelectedCard(card)}
//             className={`min-w-[150px] lg:min-w-0 p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer ${
//               selectedCard?.id === card.id ? "ring-2 ring-blue-500" : ""
//             }`}
//           >
//             <h3 className="font-bold text-sm">{card.preview.title}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Full Card Details */}
//       <div className="flex-grow bg-white border rounded-lg shadow-md p-6">
//         {selectedCard ? (
//           selectedCard.component
//         ) : (
//           <p className="text-gray-500">Select a card to view its details.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InvoicePDF;

import React from "react";
import InvoiceCard2 from "./InvoicePDF2";
import InvoiceCard3 from "./InvoicePDF3";

const InvoicePDF = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
        Invoice Previews
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1 */}
        <div className="bg-white border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-500 mb-4">
            Invoice Preview 1
          </h3>
          <InvoiceCard2 />
        </div>
        {/* Card 2 */}
        <div className="bg-white border rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-500 mb-4">
            Invoice Preview 2
          </h3>
          <InvoiceCard3 />
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
