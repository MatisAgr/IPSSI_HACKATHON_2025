import React from 'react';
import { FaCog, FaEnvelope, FaBell } from 'react-icons/fa';

import ProfileBanner from '../ProfileBanner';
import UserPicture from '../UserCardsItems/UserPicture';
import UserFeatures from '../UserCardsItems/UserFeatures';
import UserActions from '../UserCardsItems/UserActions';

import IconButton from '../Buttons/IconButton';
import FollowButton from '../Buttons/FollowButton';

interface UserCardProps {
  user: {
    username: string;
    name: string;
    hashtag?: string;
    bio: string;
    followers: string;
    following: string;
    profileImage: string;
    coverImage: string;
    joinDate: string;
    isPremium?: boolean;
    isFollowing?: boolean;
    onFollowToggle?: () => void; // Déplacé à l'intérieur de user pour correspondre à votre format
  };
  onSettingsClick?: () => void;
  isAuthenticated?: boolean;
  isOtherUser?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onSettingsClick, 
  isAuthenticated = true,
  isOtherUser = false
}) => {

  console.log("User data in UserCard:", user);
  console.log("Follow status:", user.isFollowing);
  console.log("Is other user profile:", isOtherUser);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ProfileBanner coverImage={user.coverImage || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"} />

      {/* Section profil (photo + infos) */}
      <div className="p-4 flex flex-col md:flex-row gap-6 relative">
        {/* Photo de profil */}
        <UserPicture profileImage={user.profileImage || "https://randomuser.me/api/portraits/lego/1.jpg"} />

        {/* Informations utilisateur */}
        <UserFeatures user={user} isPremium={user.isPremium || false} />

        {/* Boutons d'action */}
        <UserActions>
          {!isOtherUser ? (
            // C'est mon profil - montrer les boutons de paramètres
            <>
              <IconButton
                icon={<FaBell className="h-5 w-5" />}
                onClick={() => alert("Notifications à compléter")}
              />
              <IconButton
                icon={<FaCog className="h-5 w-5" />}
                onClick={onSettingsClick || (() => alert("Paramètres à compléter"))}
              />
            </>
          ) : (
            // C'est le profil d'un autre utilisateur - montrer Follow et Message
            <>
              <FollowButton 
                isFollowing={user.isFollowing}
                onToggle={user.onFollowToggle}
              />
              <IconButton
                icon={<FaEnvelope className="h-5 w-5" />}
                onClick={() => alert("Message à compléter")}
              />
            </>
          )}
        </UserActions>
      </div>
    </div>
  );
};