import React from "react";
import "@/styles/ButtonBox.css";

interface ButtonBoxProps {
  stacked?: boolean;
  children: React.ReactNode;
}

const ButtonBox: React.FC<ButtonBoxProps> = ({ stacked = true, children }) => {
  return (
    <div className={`button-box ${stacked ? "stacked" : "side-by-side"}`}>
      {children}
    </div>
  );
};

export default ButtonBox;
