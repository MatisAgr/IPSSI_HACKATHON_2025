import React from 'react';

interface ProfileBannerProps {
  coverImage: string; // URL de l'image de couverture
  // URL de l'avatar
  // Nom d'utilisateur
 
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({ coverImage }) => {
  return (
    <div
      className="w-full h-64 bg-cover bg-center"
      style={{ backgroundImage: `url(${coverImage})` }}
    ></div>
  );
};

export default ProfileBanner;
