import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUserPlus, FiUserCheck } from "react-icons/fi";
import FadeIn from "../Animations/FadeIn";
import { useNavigate } from "react-router-dom";

import PremiumIcon from "../../constants/PremiumIcon";

interface User {
  id: string;
  username: string;
  hashtag: string;
  profileImage: string;
  isFollowing?: boolean;
  premium?: boolean;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  onFollowToggle?: (userId: string) => void;
  onUserClick?: (userId: string, hashtag: string) => void;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  users,
  onFollowToggle,
  onUserClick
}) => {
  const navigate = useNavigate();
  
  // Fonction de gestion du clic sur un utilisateur
  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user.id, user.hashtag);
    } else {
      navigate(`/user/${user.hashtag}`);
      onClose(); 
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50"
        >
          {/* Fond assombri avec flou */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className="fixed inset-0 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Contenu du modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <FadeIn 
              direction="down" 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto border border-gray-200"
              duration={0.3}
              delay={0.1}
            >
              {/* En-tête avec titre et bouton de fermeture */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">{title} ({users.length})</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Liste des utilisateurs */}
              <div className="max-h-80 overflow-y-auto hide-scrollbar">
                {users.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Aucun utilisateur à afficher
                  </div>
                ) : (
                  users.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center">
                        {/* Avatar / Photo de profil */}
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                          <img 
                            src={user.profileImage} 
                            alt={`${user.username}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Image de remplacement en cas d'erreur
                              e.currentTarget.src = "https://via.placeholder.com/40";
                            }}
                          />
                        </div>
                        
                        {/* Informations utilisateur */}
                        <div className="ml-3">
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{user.username}</p>
                            {user.premium && (
                              <PremiumIcon size="sm" className="ml-1" />
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-1">
                            <span>@{user.hashtag}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bouton Suivre/Ne plus suivre (optionnel) */}
                      {onFollowToggle && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onFollowToggle(user.id);
                          }}
                          className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.isFollowing
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          } transition-colors`}
                        >
                          {user.isFollowing ? (
                            <>
                              <FiUserCheck className="mr-1" />
                              <span>Suivi</span>
                            </>
                          ) : (
                            <>
                              <FiUserPlus className="mr-1" />
                              <span>Suivre</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Pied de modal avec bouton de fermeture */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition duration-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </FadeIn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowListModal;