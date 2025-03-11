import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { loginUser } from "../../callApi/CallApi_Login";
import ForgetPasswordModal from "../Modals/ForgetPasswordModal";
import FadeIn from "../Animations/FadeIn";
// Import des icônes
import { FiMail, FiLock, FiAlertCircle, FiLogIn, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgetPasswordModalOpen, setIsForgetPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    // Reset error state
    setError("");
    setLoading(true);

    try {
      // Appel à l'API d'authentification
      const response = await loginUser({ email, password, remember: isRememberMeChecked });

      // Notification de succès
      if (onLoginSuccess) onLoginSuccess();

      // Rediriger vers la page d'accueil
      console.log("email: ", email);
      console.log("password: ", password);
      console.log("isRememberMeChecked: ", isRememberMeChecked);
      console.log(response);
      // navigate("/");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRememberMeChecked(e.target.checked);
  };

  const openForgetPasswordModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsForgetPasswordModalOpen(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <FadeIn key="email-step" className="w-full">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
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
                className="w-full pl-10 py-3 bg-white bg-opacity-90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="exemple@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-gray-600 text-sm font-medium flex items-center">
                <FiLock className="mr-2" />
                Mot de passe
              </label>
              <button
                onClick={openForgetPasswordModal}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                J'ai oublié mon mot de passe
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              checked={isRememberMeChecked}
              onChange={handleRememberMeChange}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
              Se souvenir de moi
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Connexion en cours...
              </>
            ) : (
              <>
                <FiLogIn className="mr-2" />
                Se connecter
              </>
            )}
          </button>
        </form>
      </FadeIn>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mt-2">
            <FiUserPlus className="mr-1" />
            S'inscrire
          </Link>
        </p>
      </div>

      {/* Modal de réinitialisation de mot de passe */}
      <ForgetPasswordModal
        isOpen={isForgetPasswordModalOpen}
        onClose={() => setIsForgetPasswordModalOpen(false)}
      />
    </div>
  );
};

export default LoginForm;