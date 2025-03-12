import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/Forms/RegisterForm';
import { toast } from 'react-toastify';
import APP_NAME from '../constants/AppName';

export default function Register() {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    toast.success('Inscription réussie ! Veuillez vérifier votre email.');
    // La redirection est gérée après la fermeture du modal de confirmation
    // navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-100">
      {/* Bulles décoratives en arrière-plan */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-1/3 left-2/3 w-28 h-28 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
      
      {/* Bulle principale contenant le formulaire */}
      <div className="relative w-full max-w-md mx-4 bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Formes décoratives */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full opacity-10 pointer-events-none"></div>
        
        <div className="px-8 pt-10 pb-8">
          {/* Titre avec le nom de l'application */}
          <h1 className="text-center mb-8">
            <span className="block text-2xl font-light text-gray-600">Inscription à </span>
            <span className="block text-4xl font-bold text-blue-600 mt-1">{APP_NAME}</span>
          </h1>
          
          {/* Formulaire d'inscription */}
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </div>
  );
}