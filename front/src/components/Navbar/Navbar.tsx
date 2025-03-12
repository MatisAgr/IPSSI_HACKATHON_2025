import React, { useState } from "react";
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut, FiUsers, FiEdit, FiBookmark, FiHome } from "react-icons/fi";
import NavItem from "./NavItem";
import { Link } from "react-router-dom";
import APP_NAME from "../../constants/AppName";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav 
            className="fixed top-0 left-0 right-0 bg-white bg-opacity-20 backdrop-blur-lg text-indigo-900 shadow-lg border-b border-white border-opacity-20 z-50 rounded-b-3xl mx-5 p-2"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo avec animation */}
                <Link to="/" className="flex items-center space-x-2 group">
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                            {APP_NAME}
                        </h1>
                        <motion.div 
                            className="h-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                    </motion.div>
                </Link>

                {/* Menu Burger (Mobile) avec animation */}
                <motion.button 
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-indigo-700"
                    onClick={() => setIsOpen(!isOpen)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
                    }}
                >
                    {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                </motion.button>

                {/* Menu desktop */}
                <ul className="hidden md:flex justify-end items-center space-x-3">
                    <NavItem to="/" icon={<FiHome />} label="Accueil" />
                    <NavItem to="/feed" icon={<FiUsers />} label="Feed" />
                    <NavItem to="/login" icon={<FiLogIn />} label="Connexion" />
                    <NavItem to="/register" icon={<FiUser />} label="Inscription" />
                    <NavItem to="/profile" icon={<FiUser />} label="Profil" />
                </ul>
            </div>

            {/* Menu mobile avec animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div 
                            className="bg-white bg-opacity-20 backdrop-blur-lg border-t border-white border-opacity-20 px-4 py-2 rounded-2xl mt-2"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                        >
                            {/* Liste des liens mobile */}
                            <ul className="flex flex-col space-y-2 py-2">
                                <NavItem to="/" icon={<FiHome />} label="Accueil" />
                                <NavItem to="/feed" icon={<FiUsers />} label="Feed" />
                                <NavItem to="/login" icon={<FiLogIn />} label="Connexion" />
                                <NavItem to="/register" icon={<FiUser />} label="Inscription" />
                                <NavItem to="/profile" icon={<FiUser />} label="Profil" />
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;