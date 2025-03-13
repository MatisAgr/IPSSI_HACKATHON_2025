import { useEffect } from 'react';
import { socket } from '../utils/socket';

const useSocketAuth = () => {
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Connecter le socket s'il n'est pas déjà connecté
      if (!socket.connected) {
        socket.connect();
      }
      // Une fois connecté, authentifier
      socket.on('connect', () => {
        console.log('Socket reconnecté avec l\'id:', socket.id);
        socket.emit('authenticate', user.id);
        console.log('Socket authentifié pour l\'utilisateur', user.id);
      });
    }
  }, []);
};

export default useSocketAuth;
