import React, { useState } from "react";

function Tooltip({ children, tooltip, position = "top", visible = true }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const positionClasses = {
    top: {
      tooltip: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      arrow: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-700",
    },
    bottom: {
      tooltip: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      arrow:
        "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-700",
    },
    left: {
      tooltip: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      arrow:
        "left-full top-1/2 transform -translate-y-1/2 border-l-8 border-t-transparent border-b-transparent border-l-gray-700",
    },
    right: {
      tooltip: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      arrow:
        "right-full top-1/2 transform -translate-y-1/2 border-r-8 border-t-transparent border-b-transparent border-r-gray-700",
    },
  };

  const currentPosition = positionClasses[position] || positionClasses.top;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Trigger Element */}
      {children}

      {/* Tooltip */}
      {showTooltip && visible && (
        <div
          className={`absolute z-50 px-3 py-2 bg-gray-700 text-white text-sm rounded shadow-lg max-w-[200px] w-max ${currentPosition.tooltip}`}
        >
          {tooltip}

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${currentPosition.arrow}`}
          ></div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
