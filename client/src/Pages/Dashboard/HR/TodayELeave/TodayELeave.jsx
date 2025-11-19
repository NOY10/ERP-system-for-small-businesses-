// import React from "react";

// function TodayELeave({ data }) {
//   const today = new Date().toISOString().split("T")[0]; // Get today's date in "YYYY-MM-DD" format

//   // Filter leaves where today falls between startDate and endDate, and status is "Approved"
//   const todayLeaves = data.filter(
//     (leave) =>
//       leave.status === "Pending" &&
//       leave.startDate <= today &&
//       leave.endDate >= today
//   );

//   return (
//     <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
//       <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
//         <h4 className="text-base md:text-lg font-medium text-gray-700">
//           Leave Taken Today
//         </h4>
//       </div>

//       <div className="h-[300px] overflow-y-auto py-2">
//         {!data ? (
//           <div>here</div>
//         ) : (
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
//                 <th className="p-3 text-left">Employee</th>
//                 <th className="p-3 text-left">Leave Type</th>
//                 <th className="p-3 text-left">Start Date</th>
//                 <th className="p-3 text-left">End Date</th>
//                 <th className="p-3 text-left">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {todayLeaves.length > 0 ? (
//                 todayLeaves.map((leave, index) => (
//                   <tr
//                     key={index}
//                     className="border-b hover:bg-gray-50 transition duration-200 text-gray-600"
//                   >
//                     <td className="p-3 font-medium">
//                       {leave.employee?.name || "Unknown"}
//                     </td>
//                     <td className="p-3">{leave.leaveType}</td>
//                     <td className="p-3">{leave.startDate}</td>
//                     <td className="p-3">{leave.endDate}</td>
//                     <td className="p-3">
//                       <span className="px-3 py-1 rounded-lg text-xs font-semibold text-green-700 bg-green-100">
//                         {leave.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="p-6 text-center text-gray-500 italic"
//                   >
//                     No leaves taken today.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }

// export default TodayELeave;

import React from "react";
import Tooltip from "../../../../Components/Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

function TodayELeave({ data }) {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in "YYYY-MM-DD" format

  // Filter leaves where today falls between startDate and endDate, and status is "Pending"
  const todayLeaves = data?.filter(
    (leave) =>
      leave.status === "Pending" &&
      leave.startDate <= today &&
      leave.endDate >= today
  );

  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
        <h4 className="text-base md:text-lg font-medium text-gray-700">
          Unapproved Leave Requests
        </h4>
        <Tooltip
          tooltip="Lists of employees with unapproved leave requests"
          position="bottom"
        >
          <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
        </Tooltip>
      </div>

      <div className="h-[300px] overflow-y-auto py-2">
        {!data ? (
          <div className="space-y-4">
            {/* Row-wise loading bars */}
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 px-2 mt-4"
              >
                <div className="w-28 h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="h-full bg-gray-300 animate-pulse"></div>
                </div>
                <div className="w-32 h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="h-full bg-gray-300 animate-pulse"></div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="h-full bg-gray-300 animate-pulse"></div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="h-full bg-gray-300 animate-pulse"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="h-full bg-gray-300 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : todayLeaves?.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            No leaves taken today.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Leave Type</th>
                <th className="p-3 text-left">Start Date</th>
                <th className="p-3 text-left">End Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {todayLeaves.map((leave, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition duration-200 text-gray-600"
                >
                  <td className="p-3 font-medium">
                    {leave.employee?.name || "Unknown"}
                  </td>
                  <td className="p-3">{leave.leaveType}</td>
                  <td className="p-3">{leave.startDate}</td>
                  <td className="p-3">{leave.endDate}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold text-green-700 bg-green-100">
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TodayELeave;
