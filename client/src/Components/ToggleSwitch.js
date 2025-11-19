import React from "react";

const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <div
      onClick={handleToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        isOn ? "bg-blue-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
          isOn ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
};

export default ToggleSwitch;