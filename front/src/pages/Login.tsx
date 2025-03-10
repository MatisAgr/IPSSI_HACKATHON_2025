import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Forms/LoginForm';
import { toast } from 'react-toastify';
import APP_NAME from '../constants/AppName';

export default function Login() {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    toast.success('Connexion réussie !');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-100">
      {/* Bulles décoratives en arrière-plan */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
      
      {/* Bulle principale contenant le formulaire */}
      <div className="relative w-full max-w-md mx-4 bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        {/* Forme décorative en haut */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-10"></div>
        
        <div className="px-8 pt-10 pb-8">
          {/* Titre avec le nom de l'application */}
          <h1 className="text-center mb-8">
            <span className="block text-2xl font-light text-gray-600">Connexion à </span>
            <span className="block text-4xl font-bold text-blue-600 mt-1">{APP_NAME}</span>
          </h1>
          
          {/* Formulaire de connexion */}
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}