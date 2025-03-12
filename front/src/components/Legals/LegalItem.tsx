import React from "react";

interface LegalItemProps {
  label: string;
  url?: string;
  newTab?: boolean; // Permet d'ouvrir le lien dans un nouvel onglet
}

const LegalItem: React.FC<LegalItemProps> = ({ label, url = "#", newTab = false }) => {
  return (
    <a 
      href={url} 
      className="text-gray-600 text-sm hover:underline"
      target={newTab ? "_blank" : "_self"} 
      rel={newTab ? "noopener noreferrer" : undefined} // Sécurité pour les nouveaux onglets
    >
      {label}
    </a>
  );
};

export default LegalItem;

