import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;       // L'icône à afficher
  onClick?: () => void;         // Action au clic (optionnelle)
  className?: string;           // Classes CSS personnalisables
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`border border-gray-300 hover:bg-gray-100 text-gray-700 p-2 rounded-full transition-colors duration-200 flex items-center justify-center ${className}`}
    >
      {icon}
    </button>
  );
};

export default IconButton;
