import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FollowButtonProps {
  isFollowing?: boolean;
  onToggle?: () => void;
  label?: string;
}

// Composant de particule unique
const Particle = ({ index }: { index: number }) => {
  const randomAngle = Math.random() * Math.PI * 2;
  const distance = 40 + Math.random() * 60;
  const x = Math.cos(randomAngle) * distance;
  const y = Math.sin(randomAngle) * distance;
  
  // Couleurs variées pour les particules
  const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{ 
        x: x, 
        y: y, 
        opacity: 0,
        scale: 0.8 + Math.random() * 1.2
      }}
      transition={{ 
        duration: 0.6 + Math.random() * 0.5,
        ease: "easeOut"
      }}
    />
  );
};

const FollowButton: React.FC<FollowButtonProps> = ({ 
  isFollowing = false, 
  onToggle, 
  label 
}) => {
  const [showParticles, setShowParticles] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const buttonLabel = label || (isFollowing ? "Ne plus suivre" : "Suivre");
  
  const baseClasses = "px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer";
  const followingClasses = "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700";
  const notFollowingClasses = "bg-blue-500 hover:bg-blue-600 text-white";
  
  const handleClick = () => {
    if (!isFollowing && onToggle) {
      setIsAnimating(true);
      setShowParticles(true);
      
      setTimeout(() => {
        onToggle();
        setIsAnimating(false);
        setTimeout(() => setShowParticles(false), 800);
      }, 300);
    } else if (onToggle) {
      onToggle();
    }
  };
  
  useEffect(() => {
    if (!isFollowing) {
      setShowParticles(false);
    }
  }, [isFollowing]);

  const shakeVariants = {
    shake: {
      x: [0, -4, 6, -8, 6, -4, 2, 0],
      y: [0, 2, -3, 4, -2, 1, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="relative">
      <motion.button 
        className={`${baseClasses} ${isFollowing ? followingClasses : notFollowingClasses} relative z-10`}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0 }}
        animate={isAnimating ? "shake" : { 
          opacity: 1,
          backgroundColor: isFollowing ? "#ffffff" : "#3b82f6",
          color: isFollowing ? "#374151" : "#ffffff",
          borderColor: isFollowing ? "#d1d5db" : "transparent"
        }}
        variants={shakeVariants}
        transition={{ 
          duration: 0.2,
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          key={buttonLabel}
        >
          {buttonLabel}
        </motion.span>
      </motion.button>
      
      {/* Conteneur des particules */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {showParticles && (
            <>
              {[...Array(12)].map((_, i) => (
                <Particle key={i} index={i} />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FollowButton;