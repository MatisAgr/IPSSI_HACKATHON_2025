import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import APP_NAME from '../constants/AppName';
import ButtonStandard from '../components/Buttons/ButtonStandard';

// Composant pour les bulles animées
const AnimatedBubble: React.FC<{
  className: string;
  animationProps: any;
  transitionProps: any;
}> = ({ className, animationProps, transitionProps }) => {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      animate={animationProps}
      transition={transitionProps}
      style={{ willChange: "transform, opacity" }} // Optimisation des performances
    />
  );
};

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/register');
    };

    // Variants pour animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                when: "beforeChildren", 
                staggerChildren: 0.3,
                duration: 1 
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring", 
                stiffness: 100 
            }
        }
    };

    const logoVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { 
                duration: 1.2,
                ease: "easeOut"
            }
        }
    };

    // Animation en boucle pour le sous-titre
    const pulseVariants = {
        initial: { opacity: 0.7 },
        animate: { 
            opacity: 1,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse" as const
            }
        }
    };

    // Animation en boucle pour la bordure lumineuse
    const glowVariants = {
        initial: { 
            boxShadow: "0 0 0px rgba(99, 102, 241, 0.3)" 
        },
        animate: { 
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.7)",
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div 
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-400 p-4 overflow-hidden relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Bulles animées au fond */}
            <AnimatedBubble
                className="top-10 right-10 w-20 h-20 bg-blue-400 opacity-30"
                animationProps={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["50%", "30%", "50%"]
                }}
                transitionProps={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "loop"
                }}
            />
            
            <AnimatedBubble
                className="bottom-10 left-10 w-16 h-16 bg-purple-500 opacity-30"
                animationProps={{ 
                    y: [0, -30, 0],
                    x: [0, 30, 0],
                    scale: [1, 1.3, 1],
                }}
                transitionProps={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            />

            {/* Nouvelles bulles animées */}
            <AnimatedBubble
                className="top-1/4 left-1/4 w-28 h-28 bg-indigo-500 opacity-20"
                animationProps={{ 
                    x: [0, 50, 0],
                    y: [0, -50, 0],
                }}
                transitionProps={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />

            <AnimatedBubble
                className="bottom-1/4 right-1/4 w-24 h-24 bg-blue-300 opacity-25"
                animationProps={{ 
                    scale: [1, 1.4, 1],
                    rotate: [0, 180, 360]
                }}
                transitionProps={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <AnimatedBubble
                className="top-2/3 left-10 w-12 h-12 bg-indigo-600 opacity-10"
                animationProps={{ 
                    y: [0, -60, 0],
                    x: [0, 40, 0],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transitionProps={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />

            <AnimatedBubble
                className="top-20 left-1/3 w-14 h-14 bg-purple-400 opacity-15"
                animationProps={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -30, 0]
                }}
                transitionProps={{
                    duration: 9,
                    repeat: Infinity,
                }}
            />

            <AnimatedBubble
                className="bottom-40 right-20 w-10 h-10 bg-blue-500 opacity-20"
                animationProps={{ 
                    y: [0, -40, 0],
                    rotate: [0, 180, 360]
                }}
                transitionProps={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            <AnimatedBubble
                className="top-1/2 right-1/3 w-16 h-16 bg-indigo-400 opacity-15"
                animationProps={{ 
                    scale: [1, 1.2, 0.9, 1],
                    rotate: [0, 90, 180, 270, 360]
                }}
                transitionProps={{
                    duration: 13,
                    repeat: Infinity,
                }}
            />

            {/* Contenu principal */}
            <motion.div 
                className="max-w-4xl w-full px-8 py-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-20 relative z-10"
                variants={glowVariants}
                initial="initial"
                animate="animate"
            >
                <motion.div 
                    className="text-center mb-16"
                    variants={logoVariants}
                    initial="initial"
                    animate="animate"
                >
                    <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 mb-2">
                        {APP_NAME}
                    </h1>
                    
                    <motion.h2 
                        className="text-xl md:text-2xl font-medium text-indigo-900 mt-4"
                        variants={pulseVariants}
                        initial="initial"
                        animate="animate"
                    >
                        Votre visage parle pour vous !
                    </motion.h2>
                </motion.div>

                <motion.div className="flex flex-col sm:flex-row justify-center gap-6" variants={itemVariants}>
                    <ButtonStandard 
                        label="Connexion" 
                        onClick={handleLogin} 
                        hoverClass="hover:bg-indigo-600 hover:scale-105 transform transition-transform" 
                        shadowClass="shadow-lg shadow-indigo-500/50 transition"
                        className="px-10 py-4 text-lg font-medium rounded-full bg-indigo-500 text-white cursor-pointer"
                    />
                    
                    <ButtonStandard 
                        label="Inscription" 
                        onClick={handleSignup} 
                        hoverClass="hover:bg-blue-600 hover:scale-105 transform transition-transform" 
                        shadowClass="shadow-lg shadow-blue-500/50 transition"
                        className="px-10 py-4 text-lg font-medium rounded-full bg-blue-500 text-white cursor-pointer"
                    />
                </motion.div>
                
                <motion.div 
                    className="mt-16 text-center text-indigo-900/70"
                    variants={itemVariants}
                >
                    <p className="text-lg">Rejoignez la communauté et partagez vos moments</p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Home;