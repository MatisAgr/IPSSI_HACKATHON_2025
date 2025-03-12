import React from "react";

interface FollowButtonProps {
  label?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ label = "Suivre" }) => {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-colors duration-200">
      {label}
    </button>
  );
};

export default FollowButton;
