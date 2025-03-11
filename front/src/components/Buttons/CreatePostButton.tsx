import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX } from 'react-icons/fi';
import CreatePostModal from '../Modals/CreatePostModal';

interface CreatePostButtonProps {
  onClick?: () => void;
  user: {
    name: string;
    username: string;
    profileImage: string;
    verified?: boolean;
  };
}

const CreatePostButton = ({ onClick, user }: CreatePostButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
    }
  };
  
  const handleSubmitPost = (postData: { content: string; images: string[] }) => {
    console.log('Post soumis:', postData);
    // Ici vous pouvez ajouter la logique pour envoyer le post à l'API
  };
  
  return (
    <>
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 20,
          delay: 0.3 
        }}
      >
        <motion.button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl cursor-pointer"
          style={{ 
            boxShadow: "0 10px 25px -3px rgba(59, 130, 246, 0.6), 0 4px 15px -5px rgba(0, 0, 0, 0.3)"
          }}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.7), 0 8px 25px -5px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isHovered ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isHovered ? <FiX size={24} /> : <FiPlus size={24} />}
          </motion.div>
        </motion.button>
        
        {/* Texte qui apparaît au survol */}
        <motion.div 
          className="absolute top-1/2 right-full mr-2 transform -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          Créer un post
        </motion.div>
      </motion.div>
      
      {/* Modal de création de post */}
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPost}
        user={user}
      />
    </>
  );
};

export default CreatePostButton;