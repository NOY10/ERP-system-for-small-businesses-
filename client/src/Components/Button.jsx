import React from "react";

// import { useAppContext } from "../contexts/ContextProvider";

const Button = ({
  icon,
  bgColor,
  color,
  bgHoverColor,
  size,
  text,
  borderRadius,
  width,
  paddingX,
  paddingY,
  onClick,
}) => {
  // const { setIsClicked, initialState } = useAppContext();

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        color,
        borderRadius,
        width,
      }}
      className={`text-${size} hover:drop-shadow-xl hover:bg-${
        bgHoverColor || "navBg"
      } py-${paddingY || 0} px-${paddingX || 0}`}
    >
      {icon} {text}
    </button>
  );
};

export default Button;
