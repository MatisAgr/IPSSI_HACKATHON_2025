import React from 'react';
import ButtonStandard from '../components/ButtonStandard';

const Home: React.FC = () => {
    const handleLogin = () => {
        alert("registration à faire à faire");
    };

    const handleSignup = () => {
        alert("singnup à faire");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-purple-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Tout commence ici. </h1>
            <h2 className="text-xl text-gray-600 mb-6">Votre visage parle pour vous !</h2>

            <div className="flex space-x-4">
                <ButtonStandard 
                  label="Connexion" 
                  onClick={handleLogin} 
                  hoverClass="hover:bg-indigo-500 shadow-lg " 
                  shadowClass="shadow-indigo-500/50 transition"
                />
                
                <ButtonStandard 
                  label="Inscription" 
                  onClick={handleSignup} 
                  hoverClass="hover:bg-sky-500 shadow-lg " 
                  shadowClass="shadow-blue-500/50 transition"
                />
            </div>
        </div>
    );
};

export default Home;
