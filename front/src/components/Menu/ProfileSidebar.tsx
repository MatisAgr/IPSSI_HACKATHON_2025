import React from 'react';
import { FaRegNewspaper, FaReply, FaRetweet, FaHeart, FaBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: <FaRegNewspaper className="mr-3" /> },
    { id: 'replies', label: 'Réponses', icon: <FaReply className="mr-3" /> },
    { id: 'retweets', label: 'Retweets', icon: <FaRetweet className="mr-3" /> },
    { id: 'likes', label: 'J\'aime', icon: <FaHeart className="mr-3" /> },
    { id: 'bookmarks', label: 'Signets', icon: <FaBookmark className="mr-3" /> },
  ];
  
  return (
    <motion.div 
      className="flex flex-col space-y-2 bg-white rounded-lg p-3 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-lg font-bold text-gray-800 px-4 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Navigation
      </motion.h2>
      
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-left rounded-full transition-colors flex items-center cursor-pointer
            ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          whileHover={{ 
            scale: 1.03,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.1 * (index + 1),
            duration: 0.3
          }}
        >
          <motion.span 
            className={`${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}
            animate={{ 
              rotate: activeTab === tab.id ? [0, -10, 10, -5, 5, 0] : 0,
              scale: activeTab === tab.id ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            {tab.icon}
          </motion.span>
          {tab.label}
          
          {activeTab === tab.id && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-blue-500"
              layoutId="activeTabIndicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};