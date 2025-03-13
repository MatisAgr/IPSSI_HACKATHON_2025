import React, { useState, useEffect } from "react";
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut, FiUsers } from "react-icons/fi";
import NavItem from "./NavItem";
import { Link, useNavigate, useLocation } from "react-router-dom";
import APP_NAME from "../../constants/AppName";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from 'js-cookie';
import { socket } from "../../utils/socket";

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Vérifier si l'utilisateur est authentifié au chargement et à chaque changement de route
    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
    }, [location]);

    // Fonction pour gérer la déconnexion
    const handleLogout = () => {
        // Supprimer le token des cookies
        Cookies.remove('token');
        
        // Supprimer les données utilisateur du localStorage
        localStorage.removeItem('user');
        
        // Informer le serveur avant de déconnecter
        if (socket.connected) {
            console.log('Déconnexion du WebSocket');
            socket.emit('logout'); // Optionnel: envoyer un événement au serveur
            socket.disconnect();
        }
        
        // Mettre à jour l'état
        setIsAuthenticated(false);
        
        // Rediriger vers la page d'accueil
        navigate('/');
        
        // Fermer le menu mobile si ouvert
        setIsOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-20 backdrop-blur-lg text-indigo-900 shadow-lg border-b border-white border-opacity-20 z-50 rounded-b-3xl mx-5 p-2">
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

                {/* Menu desktop - Conditionnel selon l'état d'authentification */}
                <ul className="hidden md:flex justify-end items-center space-x-3">
                    
                    {isAuthenticated ? (
                        // Liens pour utilisateurs connectés
                        <>
                            <NavItem to="/feed" icon={<FiUsers />} label="Feed" />
                            <NavItem to="/profile" icon={<FiUser />} label="Profil" />
                            <li className="list-none">
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-indigo-900 hover:bg-white hover:bg-opacity-30 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-center text-lg">
                                        <FiLogOut />
                                    </div>
                                    <span className="relative overflow-hidden">
                                        Déconnexion
                                    </span>
                                </button>
                            </li>
                        </>
                    ) : (
                        // Liens pour visiteurs
                        <>
                            <NavItem to="/login" icon={<FiLogIn />} label="Connexion" />
                            <NavItem to="/register" icon={<FiUser />} label="Inscription" />
                        </>
                    )}
                </ul>
            </div>

            {/* Menu mobile avec animation - Conditionnel selon l'état d'authentification */}
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
                                
                                {isAuthenticated ? (
                                    // Liens pour utilisateurs connectés
                                    <>
                                        <NavItem to="/feed" icon={<FiUsers />} label="Feed" />
                                        <NavItem to="/profile" icon={<FiUser />} label="Profil" />
                                        <li className="list-none">
                                            <button 
                                                onClick={handleLogout}
                                                className="flex items-center w-full gap-2 px-4 py-2 rounded-full transition-all duration-300 text-indigo-900 hover:bg-white hover:bg-opacity-30 hover:shadow-md"
                                            >
                                                <div className="flex items-center justify-center text-lg">
                                                    <FiLogOut />
                                                </div>
                                                <span className="relative overflow-hidden">
                                                    Déconnexion
                                                </span>
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    // Liens pour visiteurs
                                    <>
                                        <NavItem to="/login" icon={<FiLogIn />} label="Connexion" />
                                        <NavItem to="/register" icon={<FiUser />} label="Inscription" />
                                    </>
                                )}
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;