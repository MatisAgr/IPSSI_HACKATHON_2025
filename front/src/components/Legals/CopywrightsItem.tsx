import React from 'react';
import APP_NAME from '../../constants/AppName';

interface CopywrightsItemProps {
  networkName?: string; // Nom du réseau social (optionnel grâce à la valeur par défaut)
}

const CopywrightsItem: React.FC<CopywrightsItemProps> = ({ networkName = APP_NAME }) => {
  return (
    <div className="text-gray-500 text-sm flex items-center space-x-1">
      <span className="font-bold text-blue-600">{networkName}</span>
      <span>{networkName} Corporation &copy; {new Date().getFullYear()}</span>
    </div>
  );
};

export default CopywrightsItem;
