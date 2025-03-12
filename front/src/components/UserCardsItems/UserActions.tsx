import React from 'react';
// Fichier UserActions.tsx
//composant pour CONTENIR le bouton suivre, l'icone message et notification de la sectuon utilisateur


interface UserActionsProps {
  children: React.ReactNode;  // Permet d'insérer n'importe quel bouton
}

const UserActions: React.FC<UserActionsProps> = ({ children }) => {
  return (
    <div className="flex space-x-2 mt-4 md:mt-0 md:self-start">
      {children}
    </div>
  );
};

export default UserActions;


