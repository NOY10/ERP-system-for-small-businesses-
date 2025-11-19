import React, { useState, useEffect } from "react";

const ProgressBarCard = ({ current, overdue, color }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [animated, setAnimated] = useState(false);

  const total = current + overdue;

  const currentPercentage = total > 0 ? (current / total) * 100 : 0;
  const overduePercentage = total > 0 ? (overdue / total) * 100 : 0;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const currentOffset =
    circumference - (currentPercentage / 100) * circumference;
  const overdueOffset =
    circumference -
    ((currentPercentage + overduePercentage) / 100) * circumference;

  // Trigger animation on mount
  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Hover event for current
  const handleCurrentHover = () => {
    setShowTooltip(true);
    setTooltipText(
      <div>
        <p className="text-base">Nu. {current.toFixed(2)}</p>
        <p className="text-sm">Current</p>
      </div>
    );
  };

  // Hover event for overdue
  const handleOverdueHover = () => {
    setShowTooltip(true);
    setTooltipText(
      <div>
        <p className="text-base">Nu. {overdue.toFixed(2)}</p>
        <p className="text-sm">Overdue</p>
      </div>
    );
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipText("");
  };

  return (
    <div className="relative w-[120px] h-[120px]">
      {showTooltip && (
        <div className="absolute left-[158px] top-[10%] transform -translate-x-[50%] -translate-y-[50%] px-3 py-2 bg-white text-black text-sm cursor-pointer rounded shadow-lg z-10">
          {tooltipText}
        </div>
      )}
      <svg width="120" height="120" className="relative">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#f3f3f3"
          strokeWidth="12"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="orange"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? overdueOffset : circumference}
          className="cursor-pointer"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1.2s ease-in-out",
          }}
          onMouseEnter={handleOverdueHover}
          onMouseLeave={handleMouseLeave}
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#408dfb"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? currentOffset : circumference}
          className="cursor-pointer"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1.2s ease-in-out",
          }}
          onMouseEnter={handleCurrentHover}
          onMouseLeave={handleMouseLeave}
        />
      </svg>
    </div>
  );
};

export default ProgressBarCard;
