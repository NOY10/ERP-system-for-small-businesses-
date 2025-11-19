import React, { useState, useEffect } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const DialogBox = ({
  title,
  discription,
  isVisible,
  onClose,
  onSubmit,
  children,
  confirmText = "",
  cancelText = "",
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
    } else {
      setTimeout(() => setShowAnimation(false), 300);
    }
  }, [isVisible]);

  if (!isVisible && !showAnimation) return null;

  return (
    <div className={`modal ${isVisible ? "fade-in" : "fade-out"}`}>
      <div className={`modal-content ${isVisible ? "slide-in" : "slide-out"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <button onClick={onClose}>
            <IoCloseCircleOutline className="text-xl text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <p className="text-sm mb-2">{discription}</p>

        <div className="mb-6">{children}</div>

        {confirmText !== "" && cancelText !== "" && (
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              {cancelText}
            </button>
            <button
              onClick={onSubmit}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogBox;

// import React, { useState, useEffect } from "react";

// const DialogBox = ({
//   title,
//   discription,
//   isVisible,
//   onClose,
//   onSubmit,
//   children,
//   type = "info",
//   confirmText = "Confirm",
//   cancelText = "Cancel",
// }) => {
//   const [showAnimation, setShowAnimation] = useState(false);

//   useEffect(() => {
//     if (isVisible) {
//       setShowAnimation(true);
//     } else {
//       setTimeout(() => setShowAnimation(false), 300); // Match animation duration
//     }
//   }, [isVisible]);

//   if (!isVisible && !showAnimation) return null;

//   // Map types to images/icons
//   const typeImages = {
//     info: "/images/info-icon.png", // Replace with the actual path to your info image
//     delete: "/images/delete-icon.png", // Replace with the actual path to your delete image
//     confirm: "/images/confirm-icon.png", // Replace with the actual path to your confirm image
//   };

//   return (
//     <div className={`modal ${isVisible ? "fade-in" : "fade-out"}`}>
//       <div className={`modal-content ${isVisible ? "slide-in" : "slide-out"}`}>
//         <img
//           src={typeImages[type] || typeImages.info} // Default to 'info' if type is not found
//           alt={`${type} icon`}
//           className="w-16 h-16 mx-auto mb-4"
//         />
//         <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
//         <p className="text-sm mb-2 text-center">{discription}</p>

//         <div className="mb-6">{children}</div>

//         <div className="flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//           >
//             {cancelText}
//           </button>
//           <button
//             onClick={onSubmit}
//             className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             {confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DialogBox;
