import React from "react";

const Card3 = () => {
  const handleDownload = () => {
    // Example download action
    alert("Downloading content for Card 3...");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Card 3</h1>
      <p className="text-gray-700">This is the detailed view of Card 3.</p>
      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Download
      </button>
    </div>
  );
};

export default Card3;
