import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  className?: string;      // classes supplémentaires, si besoin
  hoverClass?: string;     // classe pour l'effet au survol
  shadowClass?: string;    // classe pour l'ombre
}

const ButtonStandard: React.FC<ButtonProps> = ({ 
    label, 
    onClick, 
    className = "", 
    hoverClass = "hover:bg-sky-500 transition", 
    shadowClass = "shadow-lg shadow-green-500/50" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg ${shadowClass} ${hoverClass} ${className}`}
    >
      {label}
    </button>
  );
};

export default ButtonStandard;
