import React from 'react';
import { FaCalendarAlt, FaUserFriends, FaUsers, FaCheck } from 'react-icons/fa';

// Fichier UserFeatures.tsx
//composant pour le nom, l'alias, la bio, la date d'inscription à la plateforme, le décompte d'abonnements, le décompte d'abonnés de la sectuon utilisateur




interface UserFeaturesProps {
  user: {
    name: string;
    username: string;
    bio: string;
    followers: string;
    following: string;
    joinDate: string;
  };
  isPremium: boolean;
}

const UserFeatures: React.FC<UserFeaturesProps> = ({ user, isPremium }) => {
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
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
          <span>
            <strong>{user.following}</strong>{" "}
            <span className="text-gray-600">abonnements</span>
          </span>
        </div>
        <div className="flex items-center">
          <FaUsers className="h-4 w-4 mr-1 text-blue-500" />
          <span>
            <strong>{user.followers}</strong>{" "}
            <span className="text-gray-600">abonnés</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserFeatures;
