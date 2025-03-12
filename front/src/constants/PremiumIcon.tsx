import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface PremiumIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PremiumIcon: React.FC<PremiumIconProps> = ({ size = 'sm', className = '' }) => {
  // Définition des tailles en fonction du paramètre
  const sizes = {
    sm: { container: 'p-1', icon: 'h-3 w-3' },
    md: { container: 'p-1.5', icon: 'h-4 w-4' },
    lg: { container: 'p-2', icon: 'h-5 w-5' },
  };

  return (
    <div className={`text-blue-500 bg-blue-100 ${sizes[size].container} rounded-full inline-flex items-center justify-center ${className}`}>
      <FaCheck className={sizes[size].icon} />
    </div>
  );
};

export default PremiumIcon;