import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { socket } from '../utils/socket';

interface User {
  id: string;
  username: string;
  hashtag: string;
  email: string;
  pdp?: string;
  premium: boolean;
  // autres propriétés si nécessaire
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'utilisateur depuis le localStorage ou d'autres sources
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Vérifier si le token est présent
        const token = Cookies.get('token');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Essayer de récupérer les données utilisateur depuis localStorage
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Authentifier le socket avec l'ID utilisateur
          if (parsedUser && parsedUser.id) {
            socket.emit('authenticate', parsedUser.id);
            console.log('Socket authentifié pour l\'utilisateur', parsedUser.id);
          }
        } else {
          // Ici, vous pourriez faire un appel API pour récupérer les données utilisateur
          // si elles ne sont pas dans le localStorage
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur d\'authentification:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction pour se connecter
  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Authentifier le socket avec l'ID utilisateur
    if (userData && userData.id) {
      socket.emit('authenticate', userData.id);
      console.log('Socket authentifié pour l\'utilisateur', userData.id);
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Déconnecter le socket
    socket.disconnect();
  };

  return { user, loading, error, login, logout };
};

export default useAuth;