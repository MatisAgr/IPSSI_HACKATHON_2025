import React, { ReactElement, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

interface ActionButtonProps {
  icon: ReactElement;  // L'icône React à afficher
  count?: number;      // Nombre optionnel à afficher (likes, retweets, etc.)
  onClick?: () => void; // Fonction de clic
  isActive?: boolean;  // État actif/inactif du bouton
  activeColor?: string; // Couleur quand actif (text-red-500, text-green-500, etc.)
  hoverColor?: string;  // Couleur au survol (hover:text-blue-500, etc.)
  showBg?: boolean;     // Afficher un fond sur l'icône
  activeBgColor?: string; // Couleur du fond quand actif (bg-red-50, etc.)
  hoverBgColor?: string;  // Couleur du fond au survol (group-hover:bg-blue-50, etc.)
  filled?: boolean;     // Icône pleine quand active
  className?: string;   // Classes supplémentaires
  ariaLabel?: string;   // Texte d'accessibilité
  disable?: boolean;    // Désactiver les boutons
}

/**
 * Bouton d'action réutilisable pour les interactions sociales (likes, retweets, etc.)
 * avec animations Framer Motion
 */
const ActionButton = ({
  icon,
  count,
  onClick,
  isActive = false,
  activeColor = 'text-blue-500',
  hoverColor = 'hover:text-blue-500',
  showBg = true,
  activeBgColor = 'bg-blue-50',
  hoverBgColor = 'group-hover:bg-blue-50',
  filled = false,
  className = '',
  ariaLabel = 'Action button',
  disable = false
}: ActionButtonProps) => {
  // Contrôles d'animation
  const controls = useAnimationControls();
  
  // Clone l'icône pour ajouter la classe fill-current si nécessaire
  const iconWithProps = React.cloneElement(icon as React.ReactElement<any>, {
    className: `h-5 w-5 ${filled && isActive ? 'fill-current' : ''}`
  });

  // Déclencher l'animation de pulsation quand l'état actif change
  useEffect(() => {
    if (isActive) {
      // Animation séquentielle au lieu de keyframes multiples
      const animatePulse = async () => {
        await controls.start({ scale: 1.2, transition: { type: "spring", duration: 0.2 } });
        await controls.start({ scale: 1, transition: { type: "spring", duration: 0.2 } });
      };
      animatePulse();
    }
  }, [isActive, controls]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group flex items-center cursor-pointer ${
        isActive ? activeColor : `text-gray-500 ${hoverColor}`
      } ${className}`}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disable}
    >
      <motion.div 
        className={`p-2 rounded-full ${
          showBg ? (isActive ? activeBgColor : hoverBgColor) : ''
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={controls}
      >
        {iconWithProps}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {typeof count === 'number' && count > 0 && (
          <motion.span 
            key={count} // Important pour déclencher l'animation lors du changement de valeur
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="ml-1 text-sm"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ActionButton;