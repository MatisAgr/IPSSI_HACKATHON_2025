import React, { useState } from "react";
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut, FiUsers, FiEdit, FiBookmark } from "react-icons/fi";
import NavItem from "./NavItem"; // 👈 On importe le composant
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-neutral-50 text-slate-700 p-4 shadow-md w-full">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo - nom de l'app à trouver plus tard */}
                <Link to="/feed" className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold">FaceTer</h1>
                </Link>

                {/* Menu Burger (Mobile) */}
                <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Liste des liens */}
                <ul className={`absolute md:static top-16 left-0 w-full md:w-auto bg-blue-600 md:bg-transparent text-center md:flex md:justify-center md:space-x-8 transition-all duration-300 ease-in ${isOpen ? "block" : "hidden"}`}>
                    <NavItem to="/create_post" icon={<FiEdit />} label="Créer un Post" />
                    <NavItem to="/register" icon={<FiUser />} label="Inscription" />
                    <NavItem to="/login" icon={<FiLogIn />} label="Connexion" />
                    <NavItem to="/logout" icon={<FiLogOut />} label="Déconnexion" />
                    {/* <NavItem to="/followers" icon={<FiUsers />} label="Followers" /> */}
                    {/* <NavItem to="/post_saved" icon={<FiBookmark />} label="Posts enregistrés" /> */}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
