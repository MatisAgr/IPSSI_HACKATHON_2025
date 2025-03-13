import React, { useState } from 'react';
import { FaCalendarAlt, FaUserFriends, FaUsers } from 'react-icons/fa';
import FollowListModal from '../Modals/FollowListModal';
import PremiumIcon from '../../constants/PremiumIcon';

interface User {
  id: string;
  username: string;
  hashtag: string;
  profileImage: string;
  isFollowing?: boolean;
  premium?: boolean;
}

interface UserFeaturesProps {
  user: {
    username: string;
    name: string;
    bio: string;
    followers: string;
    following: string;
    joinDate: string;
  };
  isPremium: boolean;
  followersData?: User[];
  followingData?: User[];
  followsLoading?: boolean;
  onFollowToggle?: (userId: string) => void;
  onUserClick?: (userId: string, hashtag: string) => void;
}

const UserFeatures: React.FC<UserFeaturesProps> = ({ 
  user, 
  isPremium, 
  followersData = [],
  followingData = [],
  followsLoading = false,
  onFollowToggle,
  onUserClick
}) => {
  // gérer l'ouverture/fermeture des modales
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          {isPremium && (
            <PremiumIcon />
          )}
        </div>
        <div className="flex items-center text-sm space-x-1">
          <span className="text-gray-600">{user.username}</span>
        </div>
        
        <p className="mt-2 text-gray-700">{user.bio}</p>
        
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <FaCalendarAlt className="h-4 w-4 mr-1 text-blue-500" />
          <span>A rejoint en {user.joinDate}</span>
        </div>
        
        <div className="flex mt-3 space-x-4">
          {/* Section abonnements - rendue cliquable */}
          <div 
            className="flex items-center cursor-pointer hover:text-blue-500 transition-colors group" 
            onClick={() => setFollowingModalOpen(true)}
          >
            <FaUserFriends className="h-4 w-4 mr-1 text-blue-500" />
            <span>
              <strong>{user.following}</strong>{" "}
              <span className="text-gray-600 group-hover:text-blue-400 transition-colors">abonnements</span>
            </span>
          </div>
          
          {/* Section abonnés - rendue cliquable */}
          <div 
            className="flex items-center cursor-pointer hover:text-blue-500 transition-colors group" 
            onClick={() => setFollowersModalOpen(true)}
          >
            <FaUsers className="h-4 w-4 mr-1 text-blue-500" />
            <span>
              <strong>{user.followers}</strong>{" "}
              <span className="text-gray-600 group-hover:text-blue-400 transition-colors">abonnés</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modale pour les abonnés */}
      <FollowListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="Abonnés"
        users={followersData}
        onFollowToggle={onFollowToggle}
        onUserClick={onUserClick}
        isLoading={followsLoading}
      />

      {/* Modale pour les abonnements */}
      <FollowListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Abonnements"
        users={followingData}
        onFollowToggle={onFollowToggle}
        onUserClick={onUserClick}
        isLoading={followsLoading}
      />
    </>
  );
};

export default UserFeatures;