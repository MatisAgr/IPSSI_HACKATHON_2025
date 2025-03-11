import React from "react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <li className="p-2 md:p-0 flex items-center space-x-2">
      {icon}
      <NavLink to={to} className="hover:underline">{label}</NavLink>
    </li>
  );
};

export default NavItem;
