import React from 'react';

interface UserSuggestionProps {
  name: string;
  username: string;
  avatar: string;
}

const UserSuggestion: React.FC<UserSuggestionProps> = React.memo(({ name, username, avatar }) => (
  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all rounded-xl">
    <img
      src={avatar}
      alt={name}
      className="w-10 h-10 rounded-full object-cover"
      loading="lazy" // Optimisation: chargement différé des images
    />
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-indigo-900 truncate">{name}</div>
      <div className="text-xs text-gray-500 truncate">@{username}</div>
    </div>
    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
      Suivre
    </button>
  </div>
));

UserSuggestion.displayName = 'UserSuggestion';

export default UserSuggestion;