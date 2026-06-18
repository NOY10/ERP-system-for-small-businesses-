import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = ({ message = "", type = "info", duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;

    // Dynamically call the right toast method
    const showToast = () => {
      const options = { autoClose: duration, position: "top-right" };

      switch (type) {
        case "success":
          toast.success(message, options);
          break;
        case "error":
          toast.error(message, options);
          break;
        case "info":
          toast.info(message, options);
          break;
        case "warning":
          toast.warn(message, options);
          break;
        default:
          toast(message, options);
      }
    };

    showToast();
  }, [message, type, duration]);

  return <ToastContainer position="top-right" closeOnClick pauseOnHover />;
};

export default Toast;
