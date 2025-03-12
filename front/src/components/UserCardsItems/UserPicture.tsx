import React from 'react';

// Fichier UserPicture.tsx
//composant pour la photo de profile de la sectuon utilisateur

interface UserPictureProps {
  profileImage: string;
}

const UserPicture: React.FC<UserPictureProps> = ({ profileImage }) => {
  return (
    <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <img
        src={profileImage}
        alt="Photo de profil"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg";
        }}
      />
    </div>
  );
};

export default UserPicture;
