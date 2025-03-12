import React from 'react';
import { FaCalendarAlt, FaUserFriends, FaUsers, FaCheck, FaEnvelope, FaBell } from 'react-icons/fa';

import ProfileBanner from '../ProfileBanner';
import UserPicture from '../UserCardsItems/UserPicture';
import UserFeatures from '../UserCardsItems/UserFeatures';
import UserActions from '../UserCardsItems/UserActions';

import IconButtonSettings from '../Buttons/IconSettingsButton';
import IconButton from '../Buttons/IconButton';
import FollowButton from '../Buttons/FollowButton';




interface UserCardProps {
  user: {
    name: string;
    username: string;
    bio: string;
    followers: string;
    following: string;
    profileImage: string;
    coverImage: string;
    joinDate: string;
  };
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isPremium, setIsPremium] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);


  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Bannière */}
      {/* <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        <img
          src={user.bannerImage}
          alt="Bannière de profil"
          className="w-full h-full object-cover mix-blend-overlay"
          onError={(e) => {
            e.currentTarget.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg";
          }}
        />
      </div> */}
      <ProfileBanner coverImage={user.coverImage || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"} />



      {/* Section profil (photo + infos) */}
      <div className="p-4 flex flex-col md:flex-row gap-6 relative">

        {/* Photo de profil */}
        <UserPicture profileImage={user.profileImage || "https://images.unsplash.com/photo-1741514229652-9baef370a916?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} />




        {/* Informations utilisateur */}
        <UserFeatures user={user} isPremium={isPremium} />


        {/* Boutons d'action */}
        <UserActions>
          {isAuthenticated ? (
            <>
              <IconButton 
                icon={<FaBell className="h-5 w-5" />} 
                onClick={() => alert("Notifications à compléter ")} 
              />
              <IconButtonSettings onClick={() => alert("Paramètres à compléter")} />
            </>
          ) : (
            <>
              <FollowButton />
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