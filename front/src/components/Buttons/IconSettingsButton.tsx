import React from 'react';
import { FaCog } from 'react-icons/fa';

interface IconButtonSettingsProps {
  onClick?: () => void; // Action à déclencher au clic
  className?: string;   // Classes CSS supplémentaires pour personnalisation
}

const IconButtonSettings: React.FC<IconButtonSettingsProps> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`border border-gray-300 hover:bg-gray-100 text-gray-700 p-2 rounded-full transition-colors duration-200 flex items-center justify-center ${className}`}
    >
      <FaCog className="h-5 w-5" />
    </button>
  );
};

export default IconButtonSettings;