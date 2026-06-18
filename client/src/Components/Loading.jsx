import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <CircularProgress size={50} sx={{ color: "rgba(74, 144, 226, 1)" }} />
    </div>
  );
}

export default Loading;
