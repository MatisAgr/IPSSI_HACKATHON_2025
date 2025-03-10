import { useState, FormEvent, useEffect } from "react";
import { forgotPassword } from "../../callApi/CallApi_ForgetPassword";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "../Animations/FadeIn";
// Import des icônes
import { FiMail, FiKey, FiX, FiAlertCircle, FiCheckCircle, FiSend, FiArrowLeft } from "react-icons/fi";

interface ForgetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgetPasswordModal = ({ isOpen, onClose }: ForgetPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Reset form fields when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser après que l'animation de fermeture soit terminée
      const timer = setTimeout(() => {
        setEmail("");
        setError("");
        setSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation basique de l'email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      // Appel à l'API de réinitialisation
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Permet de fermer le modal avec la touche Echap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

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
            onClick={handleOverlayClick}
          />
          
          {/* Contenu du modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <FadeIn 
              direction="down" 
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md pointer-events-auto border border-gray-200"
              duration={0.3}
              delay={0.1}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiKey className="mr-2 text-blue-600" /> {/* Icône de clé */}
                  Réinitialiser votre mot de passe
                </h3>
                <button 
                  onClick={onClose} 
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                  disabled={loading}
                >
                  <FiX className="w-5 h-5" /> {/* Icône X pour fermer */}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="w-8 h-8" /> {/* Icône de succès */}
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Email envoyé !</h4>
                    <p className="text-gray-600">
                      Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <FiX className="mr-2" /> Fermer
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-gray-600 mb-6 flex items-center">
                      <FiMail className="mr-2 text-blue-500" /> {/* Icône de mail */}
                      Saisissez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
                    </p>
                    
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
                        <FiAlertCircle className="mr-2 flex-shrink-0" /> {/* Icône d'alerte */}
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-6">
                        <label htmlFor="reset-email" className="block text-gray-700 text-sm font-medium mb-2">
                          Adresse email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" /> {/* Icône dans le champ */}
                          </div>
                          <input
                            type="email"
                            id="reset-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="exemple@email.com"
                            disabled={loading}
                            autoFocus
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={onClose}
                          className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center cursor-pointer"
                          disabled={loading}
                        >
                          <FiArrowLeft className="mr-2" /> {/* Icône retour */}
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`py-2 px-4 bg-blue-600 text-white rounded-lg transition-colors flex items-center cursor-pointer ${
                            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <FiSend className="mr-2" /> {/* Icône d'envoi */}
                              Envoyer le lien
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </FadeIn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgetPasswordModal;