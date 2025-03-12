import React, { useState } from "react";

interface DropdownItem {
  label: string;
  url?: string;
}

interface LegalItemDropdownProps {
  title: string; // Titre affiché du dropdown
  items: DropdownItem[]; // Liste des éléments du dropdown
}

const LegalItemDropdown: React.FC<LegalItemDropdownProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        className="text-gray-600 text-sm hover:underline focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title} ▼
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg">
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <a 
                  href={item.url || "#"} 
                  className="block px-4 py-2 text-gray-700 text-sm hover:bg-gray-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LegalItemDropdown;
