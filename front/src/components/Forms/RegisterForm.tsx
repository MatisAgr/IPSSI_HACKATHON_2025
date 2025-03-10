import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FadeIn from "../Animations/FadeIn";
import ConfirmMailModal from "../Modals/ConfirmMailModal";
import { checkEmailExists } from "../../callApi/CallApi_CheckMail";
import { registerUser, RegisterData } from "../../callApi/CallApi_Register";
// Import des icônes
import {
  FiMail,
  FiLock,
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff
} from "react-icons/fi";

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

type RegisterStep = 'email' | 'password' | 'info' | 'interests';

const RegisterForm = ({ onRegisterSuccess }: RegisterFormProps) => {
  // État des étapes du formulaire
  const [currentStep, setCurrentStep] = useState<RegisterStep>('email');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // États de formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState(""); // "male", "female", "other"
  const [birthdate, setBirthdate] = useState("");
  
  // États UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  
  // Calcul de la progression
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'email': return 25;
      case 'password': return 50;
      case 'info': return 75;
      case 'interests': return 100;
      default: return 0;
    }
  };
  
  // TODO: Mettre le regex dans un seul fichier pour le réutiliser
  // Validation d'email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Validation de mot de passe
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };
  
  // Vérification de l'email
  const handleEmailCheck = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Veuillez saisir votre adresse email");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { exists } = await checkEmailExists(email);
      
      if (exists) {
        setError("Cette adresse email est déjà utilisée");
        return;
      }
      
      setEmailChecked(true);
      setCurrentStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };
  
  // Validation du formulaire de mot de passe
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Veuillez saisir un mot de passe");
      return;
    }
    
    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setError("");
    setCurrentStep('info');
  };
  
  // Validation des informations personnelles
  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError("Veuillez saisir un nom d'utilisateur");
      return;
    }
    
    if (!gender) {
      setError("Veuillez sélectionner votre genre");
      return;
    }
    
    if (!birthdate) {
      setError("Veuillez saisir votre date de naissance");
      return;
    }
    
    setError("");
    handleRegister();
  };
  
  // Soumission finale du formulaire
  const handleRegister = async () => {
    setLoading(true);
    setError("");
    
    const userData: RegisterData = {
      email,
      password,
      username,
      gender,
      birthdate
    };
    
    try {
      await registerUser(userData);
      setIsConfirmModalOpen(true);
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };
  
  // Fermeture du modal et redirection
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    navigate('/login');
  };
  
  // Retour à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep === 'password') setCurrentStep('email');
    if (currentStep === 'info') setCurrentStep('password');
    if (currentStep === 'interests') setCurrentStep('info');
  };
  
  // Affichage/masquage du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="w-full max-w-md">
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">Étape {currentStep === 'email' ? '1' : currentStep === 'password' ? '2' : '3'}/4</span>
          <span className="text-sm font-medium text-gray-500">{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {/* Étape 1: Email */}
        {currentStep === 'email' && (
          <FadeIn key="email-step" className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Commençons par votre email</h2>
            
            <form onSubmit={handleEmailCheck}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-600 text-sm font-medium mb-2 flex items-center">
                  <FiMail className="mr-2" />
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="exemple@email.com"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Nous vous enverrons un email de confirmation.
                </p>
              </div>
              
              <div className="flex justify-between">
                <Link to="/login" className="py-2 px-4 text-blue-600 flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Retour à la connexion
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 flex items-center cursor-pointer ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Vérification...
                    </>
                  ) : (
                    <>
                      Continuer
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </FadeIn>
        )}
        
        {/* Étape 2: Mot de passe */}
        {currentStep === 'password' && (
          <FadeIn key="password-step" className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Créez votre mot de passe</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-5">
                <label htmlFor="password" className="block text-gray-600 text-sm font-medium mb-2 flex items-center">
                  <FiLock className="mr-2" />
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-600 text-sm font-medium mb-2 flex items-center">
                  <FiLock className="mr-2" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="py-2 px-4 text-blue-600 flex items-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Retour
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 flex items-center"
                >
                  Continuer
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </FadeIn>
        )}
        
        {/* Étape 3: Informations personnelles */}
        {currentStep === 'info' && (
          <FadeIn key="info-step" className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Vos informations personnelles</h2>
            
            <form onSubmit={handleInfoSubmit}>
              <div className="mb-5">
                <label htmlFor="username" className="block text-gray-600 text-sm font-medium mb-2 flex items-center">
                  <FiUser className="mr-2" />
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Votre nom d'utilisateur"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Genre
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`flex items-center justify-center py-2 px-4 border ${
                      gender === 'male'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } rounded-lg cursor-pointer transition-colors`}
                    onClick={() => setGender('male')}
                  >
                    Homme
                  </div>
                  <div
                    className={`flex items-center justify-center py-2 px-4 border ${
                      gender === 'female'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } rounded-lg cursor-pointer transition-colors`}
                    onClick={() => setGender('female')}
                  >
                    Femme
                  </div>
                  <div
                    className={`flex items-center justify-center py-2 px-4 border ${
                      gender === 'other'
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } rounded-lg cursor-pointer transition-colors`}
                    onClick={() => setGender('other')}
                  >
                    Autre
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="birthdate" className="block text-gray-600 text-sm font-medium mb-2 flex items-center">
                  <FiCalendar className="mr-2" />
                  Date de naissance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="birthdate"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full pl-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="py-2 px-4 text-blue-600 flex items-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 flex items-center ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Inscription...
                    </>
                  ) : (
                    <>
                      S'inscrire
                      <FiCheck className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </FadeIn>
        )}
      </AnimatePresence>
      
      {/* Modal de confirmation */}
      <ConfirmMailModal 
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        email={email}
      />
    </div>
  );
};

export default RegisterForm;