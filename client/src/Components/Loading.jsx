import React from "react";
import { SlidingCubeLoader } from "react-loaders-kit";

function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SlidingCubeLoader
        loading={true}
        size={50}
        colors={["#2887D4BE", "#0976C3BE"]}
        duration={1}
      />
    </div>
  );
}

export default Loading;
