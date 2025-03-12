import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <li className="list-none">
      <NavLink 
        to={to} 
        className={({ isActive }) => `
          group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
          ${isActive 
            ? "bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-medium shadow-md" 
            : "text-indigo-900 hover:bg-white hover:bg-opacity-30 hover:shadow-md"}
        `}
      >
        <motion.div 
          className="flex items-center justify-center text-lg"
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
        
        <span className="relative overflow-hidden">
          {label}
          <motion.span 
            className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </span>
      </NavLink>
    </li>
  );
};

export default NavItem;