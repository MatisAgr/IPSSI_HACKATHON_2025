import React from 'react';
import { FaCalendarAlt, FaUserFriends, FaUsers, FaCheck, FaEnvelope, FaBell } from 'react-icons/fa';

import ProfileBanner from '../ProfileBanner';

interface UserCardProps {
  user: {
    name: string;
    username: string;
    bio: string;
    followers: string;
    following: string;
    profileImage: string;
    bannerImage: string;
    joinDate: string;
  };
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isPremium, setIsPremium] = React.useState(true);

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
      <ProfileBanner coverImage={"https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"} />

      {/* Section profil (photo + infos) */}
      <div className="p-4 flex flex-col md:flex-row gap-6 relative">



        {/* Photo de profil */}
        <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white flex-shrink-0 
                       shadow-md hover:shadow-lg transition-shadow duration-300">
          <img
            src={user.profileImage}
            alt="Photo de profil"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg";
            }}
          />
        </div>



        {/* Informations utilisateur */}
        <div className="flex flex-col flex-grow">




          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>

            {/* Badge premium */}
            {isPremium && (
              <div className="text-blue-500 bg-blue-100 p-1 rounded-full">
                <FaCheck className="h-3 w-3" />
              </div>
            )}
          </div>




          <span className="text-gray-600">{user.username}</span>
          <p className="mt-2 text-gray-700">{user.bio}</p>




          <div className="flex items-center mt-2 text-sm text-gray-600">
            <FaCalendarAlt className="h-4 w-4 mr-1 text-blue-500" />
            <span>A rejoint en {user.joinDate}</span>
          </div>




          <div className="flex mt-3 space-x-4">
            <div className="flex items-center">
              <FaUserFriends className="h-4 w-4 mr-1 text-blue-500" />
              <span><strong>{user.following}</strong> <span className="text-gray-600">abonnements</span></span>
            </div>
            <div className="flex items-center">
              <FaUsers className="h-4 w-4 mr-1 text-blue-500" />
              <span><strong>{user.followers}</strong> <span className="text-gray-600">abonnés</span></span>
            </div>
          </div>



        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2 mt-4 md:mt-0 md:self-start">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium
                           transition-colors duration-200">
            Suivre
          </button>
          <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 p-2 rounded-full
                           transition-colors duration-200">
            <FaEnvelope className="h-5 w-5" />
          </button>
          <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 p-2 rounded-full
                           transition-colors duration-200">
            <FaBell className="h-5 w-5" />
          </button>
        </div>



      </div>
    </div>
  );
};