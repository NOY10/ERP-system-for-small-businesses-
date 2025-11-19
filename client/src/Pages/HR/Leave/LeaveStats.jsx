import React from "react";

const LeaveStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8 ">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-800 flex items-center">
              {stat.title}
              {stat.icon && <span className="ml-4 text-xl">{stat.icon}</span>}
            </span>
          </div>
          <div className="mt-4 flex items-center ml-[4rem]">
            <div
              className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold`}
            >
              {stat.count}
            </div>
            <span className="ml-4 text-gray-600">Leaves</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveStats;
