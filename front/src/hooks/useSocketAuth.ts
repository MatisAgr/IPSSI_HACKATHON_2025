import { useEffect, useState } from 'react';
import { socket } from '../utils/socket';

const useSocketAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user && user.id) {
            console.log('Socket reconnecté avec l\'id:', socket.id);
            socket.emit('authenticate', user.id);
            console.log('Socket authentifié pour l\'utilisateur', user.id);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'authentification du socket:', error);
      }
    };

    // Try to connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      // If already connected, authenticate immediately
      handleConnect();
    }

    // Set up event listeners
    socket.on('connect', handleConnect);
    
    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
    };
  }, []);

  return { isAuthenticated };
};

export default useSocketAuth;
