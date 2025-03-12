import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiUser, FiImage, FiAlertCircle, FiCheckCircle, FiTag, FiEdit } from "react-icons/fi";
import { updateProfile, UserProfileData } from "../../callApi/CallApi_GetMyProfile";
import FadeIn from "../Animations/FadeIn";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedData: Partial<UserProfileData>) => void;
  userData: UserProfileData | null;
}

const UpdateUserModal = ({ isOpen, onClose, onUpdate, userData }: UpdateUserModalProps) => {
  // États pour les champs modifiables
  const [bio, setBio] = useState("");
  const [pdpUrl, setPdpUrl] = useState("");
  const [pdbUrl, setPdbUrl] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState("");

  // États pour le formulaire
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewPdp, setPreviewPdp] = useState("");
  const [previewPdb, setPreviewPdb] = useState("");

  // Initialiser les champs avec les données utilisateur actuelles
  useEffect(() => {
    if (userData) {
      setBio(userData.bio || "");
      setPdpUrl(userData.pdp || "");
      setPdbUrl(userData.pdb || "");
      setInterests(userData.interests || []);
      setPreviewPdp(userData.pdp || "");
      setPreviewPdb(userData.pdb || "");
    }
  }, [userData, isOpen]);

  // Pour réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Gérer l'ajout d'un intérêt
  const handleAddInterest = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()]);
      setCurrentInterest("");
    }
  };

  // Gérer la suppression d'un intérêt
  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  // Gérer l'aperçu de la photo de profil
  const handlePdpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPdpUrl(url);
    setPreviewPdp(url || (userData?.pdp || ""));
  };

  // Gérer l'aperçu de la photo de bannière
  const handlePdbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPdbUrl(url);
    setPreviewPdb(url || (userData?.pdb || ""));
  };

  // Fermer le modal avec confirmation si des modifications ont été effectuées
  const handleClose = () => {
    if (loading) return;
    const hasChanges = 
      bio !== (userData?.bio || "") ||
      pdpUrl !== (userData?.pdp || "") ||
      pdbUrl !== (userData?.pdb || "") ||
      JSON.stringify(interests) !== JSON.stringify(userData?.interests || []);

    if (hasChanges && !success) {
      if (confirm("Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Préparer les données à mettre à jour
      const updateData: Partial<UserProfileData> = {};
      
      if (bio !== (userData?.bio || "")) updateData.bio = bio;
      if (pdpUrl !== (userData?.pdp || "")) updateData.pdp = pdpUrl;
      if (pdbUrl !== (userData?.pdb || "")) updateData.pdb = pdbUrl;
      if (JSON.stringify(interests) !== JSON.stringify(userData?.interests || [])) updateData.interests = interests;
      
      // Si aucune modification n'a été faite
      if (Object.keys(updateData).length === 0) {
        setError("Aucune modification n'a été effectuée");
        setLoading(false);
        return;
      }

      // Appel à l'API
      const response = await updateProfile(updateData);

      if (response.success) {
        setSuccess(true);
        if (onUpdate && response.data) {
          onUpdate(response.data);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message || "Une erreur est survenue lors de la mise à jour du profil");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fermer le modal avec la touche Echap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

  // Fermer le modal en cliquant sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

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
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl pointer-events-auto border border-gray-200"
              duration={0.3}
              delay={0.1}
            >
              <div className="flex justify-between items-center mb-4 p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiEdit className="mr-2 text-blue-600" />
                  Modifier mon profil
                </h3>
                <button 
                  onClick={handleClose} 
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                  disabled={loading}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
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
                        <FiCheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">Profil mis à jour !</h4>
                      <p className="text-gray-600">
                        Vos modifications ont été enregistrées avec succès.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Message d'erreur */}
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
                          <FiAlertCircle className="mr-2 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Section formulaire */}
                        <div>
                          <form onSubmit={handleSubmit}>
                            {/* Biographie */}
                            <div className="mb-4">
                              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Biographie
                              </label>
                              <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Parlez un peu de vous..."
                                maxLength={280}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {bio.length}/280 caractères
                              </p>
                            </div>

                            {/* Photo de profil URL */}
                            <div className="mb-4">
                              <label htmlFor="pdp" className="block text-sm font-medium text-gray-700 mb-1">
                                URL de la photo de profil
                              </label>
                              <div className="flex">
                                <input
                                  id="pdp"
                                  type="url"
                                  value={pdpUrl}
                                  onChange={handlePdpChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="https://exemple.com/image.jpg"
                                />
                              </div>
                            </div>

                            {/* Photo de bannière URL */}
                            <div className="mb-4">
                              <label htmlFor="pdb" className="block text-sm font-medium text-gray-700 mb-1">
                                URL de la photo de bannière
                              </label>
                              <input
                                id="pdb"
                                type="url"
                                value={pdbUrl}
                                onChange={handlePdbChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://exemple.com/banner.jpg"
                              />
                            </div>

                            {/* Centres d'intérêts */}
                            <div className="mb-4">
                              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                                Centres d'intérêt
                              </label>
                              <div className="flex">
                                <input
                                  id="interests"
                                  type="text"
                                  value={currentInterest}
                                  onChange={(e) => setCurrentInterest(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Ajoutez un centre d'intérêt"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                                />
                                <button
                                  type="button"
                                  onClick={handleAddInterest}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                                >
                                  <FiTag />
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {interests.map((interest, index) => (
                                  <div key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center">
                                    {interest}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveInterest(interest)}
                                      className="ml-2 text-blue-500 hover:text-blue-700"
                                    >
                                      <FiX size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Informations non modifiables */}
                            <div className="mt-6 mb-8">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Informations non modifiables</h4>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Nom d'utilisateur:</strong> {userData?.username}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Hashtag:</strong> {userData?.hashtag}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Statut premium:</strong> {userData?.premium ? "Activé" : "Non activé"}
                                </p>
                              </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end space-x-4 mt-6">
                              <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={loading}
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ${
                                  loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                                }`}
                              >
                                {loading ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <FiSave className="mr-2" />
                                    Enregistrer
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Section aperçu */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Aperçu</h4>
                          
                          {/* Aperçu de la bannière */}
                          <div className="h-32 w-full rounded-t-lg overflow-hidden bg-gray-300 relative">
                            {previewPdb ? (
                              <img 
                                src={previewPdb} 
                                alt="Bannière" 
                                className="w-full h-full object-cover"
                                onError={() => setPreviewPdb("")}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                <FiImage size={24} className="mr-2" /> Aucune bannière
                              </div>
                            )}
                          </div>
                          
                          {/* Aperçu de la photo de profil et des infos */}
                          <div className="bg-white rounded-b-lg shadow p-4">
                            <div className="flex items-start">
                              <div className="relative -mt-12 mr-4">
                                <div className="h-20 w-20 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                                  {previewPdp ? (
                                    <img 
                                      src={previewPdp} 
                                      alt="Photo de profil" 
                                      className="w-full h-full object-cover"
                                      onError={() => setPreviewPdp("")}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                      <FiUser size={32} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="pt-2">
                                <div className="flex items-center">
                                  <h3 className="text-lg font-bold text-gray-800">{userData?.username}</h3>
                                  {userData?.premium && (
                                    <span className="ml-1 text-blue-500 bg-blue-100 p-1 rounded-full">
                                      <FiCheckCircle size={14} />
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-sm">@{userData?.hashtag}</p>
                              </div>
                            </div>

                            {/* Bio et intérêts */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                {bio || "Aucune biographie"}
                              </p>
                              
                              {interests.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</p>
                                  <div className="flex flex-wrap gap-1">
                                    {interests.map((interest, idx) => (
                                      <span key={idx} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateUserModal;