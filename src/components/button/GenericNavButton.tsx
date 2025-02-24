import React from "react";
import { useNavigate } from "react-router-dom";

interface GenericNavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to: string;
  title: string;
  className?: string;
}

const GenericNavButton: React.FC<GenericNavButtonProps> = ({
  to,
  title,
  className = "modal-open-btn",
  ...props
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={className}
      {...props} // Spread additional button attributes (like `disabled`, `aria-label`, etc.)
    >
      {title}
    </button>
  );
};

export default GenericNavButton;
