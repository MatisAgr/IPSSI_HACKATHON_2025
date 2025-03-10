import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "../Animations/FadeIn";
import { FiMail, FiCheck, FiX } from "react-icons/fi";

interface ConfirmMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const ConfirmMailModal = ({ isOpen, onClose, email }: ConfirmMailModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50"
        >
          {/* Fond assombri */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className="fixed inset-0 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Contenu du modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <FadeIn 
              direction="down" 
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md pointer-events-auto border border-gray-200"
              duration={0.3}
              delay={0.1}
            >
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Vérifiez votre boîte mail
                </h3>
                
                <p className="text-gray-600 mb-2">
                  Un email de confirmation a été envoyé à :
                </p>
                <p className="font-medium text-blue-600 mb-4">{email}</p>
                
                {/* TODO: Revoir le fonctionnement */}
                <p className="text-gray-600 mb-6">
                  Veuillez cliquer sur le lien dans cet email pour confirmer votre compte et continuer.
                </p>
                
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center"
                >
                  <FiCheck className="mr-2" />
                  Compris
                </button>
              </div>
            </FadeIn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmMailModal;