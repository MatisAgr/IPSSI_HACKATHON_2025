import React, { useState } from 'react';
import { FaCalendarAlt, FaUserFriends, FaUsers } from 'react-icons/fa';
import FollowListModal from '../Modals/FollowListModal';
import PremiumIcon from '../../constants/PremiumIcon';

export const mockFollowers: User[] = [
  {
    id: "1",
    username: "lea_martin",
    hashtag: "lea",
    profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    isFollowing: true,
    premium: true
  },
  {
    id: "2",
    username: "thomas_dev",
    hashtag: "thomas",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    isFollowing: false
  },
  {
    id: "3",
    username: "sophie_b",
    hashtag: "sophie",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    isFollowing: true,
    premium: true
  },
  {
    id: "4",
    username: "nico_music",
    hashtag: "nico",
    profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
    isFollowing: false
  },
  {
    id: "5",
    username: "emma_travel",
    hashtag: "emma",
    profileImage: "https://randomuser.me/api/portraits/women/33.jpg",
    isFollowing: true
  },
  {
    id: "6",
    username: "hugo_tech",
    hashtag: "hugo",
    profileImage: "https://randomuser.me/api/portraits/men/55.jpg",
    isFollowing: false,
    premium: true
  },
  {
    id: "7",
    username: "camille_r",
    hashtag: "camille",
    profileImage: "https://randomuser.me/api/portraits/women/67.jpg",
    isFollowing: true
  }
];

// Données de test pour les abonnements (following)
export const mockFollowing: User[] = [
  {
    id: "11",
    username: "alex_m",
    hashtag: "alex",
    profileImage: "https://randomuser.me/api/portraits/men/11.jpg",
    isFollowing: true,
    premium: true
  },
  {
    id: "12",
    username: "julie_art",
    hashtag: "julie",
    profileImage: "https://randomuser.me/api/portraits/women/23.jpg",
    isFollowing: true
  },
  {
    id: "13",
    username: "ant_fournier",
    hashtag: "ant",
    profileImage: "https://randomuser.me/api/portraits/men/42.jpg",
    isFollowing: true
  },
  {
    id: "14",
    username: "marine_g",
    hashtag: "marine",
    profileImage: "https://randomuser.me/api/portraits/women/51.jpg",
    isFollowing: true,
    premium: true
  },
  {
    id: "15",
    username: "paul_d",
    hashtag: "paul",
    profileImage: "https://randomuser.me/api/portraits/men/77.jpg",
    isFollowing: true
  },
  {
    id: "16",
    username: "clara_simon",
    hashtag: "clara",
    profileImage: "https://randomuser.me/api/portraits/women/89.jpg",
    isFollowing: true
  },
  {
    id: "17",
    username: "max_l",
    hashtag: "max",
    profileImage: "https://randomuser.me/api/portraits/men/91.jpg",
    isFollowing: true,
    premium: true
  },
  {
    id: "18",
    username: "ines_b",
    hashtag: "ines",
    profileImage: "https://randomuser.me/api/portraits/women/63.jpg",
    isFollowing: true
  }
];

// Interface User commune pour éviter les incohérences
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
  onFollowToggle?: (userId: string) => void;
  onUserClick?: (userId: string) => void;
}

const UserFeatures: React.FC<UserFeaturesProps> = ({ 
  user, 
  isPremium, 
  followersData = mockFollowers, 
  followingData = mockFollowing,
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
      />

      {/* Modale pour les abonnements */}
      <FollowListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Abonnements"
        users={followingData}
        onFollowToggle={onFollowToggle}
        onUserClick={onUserClick}
      />
    </>
  );
};

export default UserFeatures;