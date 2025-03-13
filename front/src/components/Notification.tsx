import React, { useEffect, useState } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from '../utils/socket';
import Cookies from 'js-cookie';

interface NotificationData {
  type: string;
  actor_id: {
    username: string;
    hashtag: string;
    pdp: string;
  };
  actorUsername?: string; // Pour le cas où l'information est envoyée directement
}

const Notification: React.FC = () => {
  // État pour savoir si le socket est connecté
  const [isConnected, setIsConnected] = useState(socket.connected);
  // On stocke le token afin de surveiller sa présence
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);

  // Fonction pour afficher une notification formatée
  const showNotification = (
    message: string,
    type: 'follow' | 'like' | 'retweet' | 'reponse' | 'mention' | 'signet' = 'follow'
  ) => {
    toast(message, {
      position: "bottom-left",
      autoClose: 50000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
  
  };

  // Formate le message de la notification en fonction du type et de l'acteur
  const formatNotificationMessage = (data: NotificationData) => {
    if (!data) return "Nouvelle notification";

    const username =
      data.actorUsername || (data.actor_id && data.actor_id.username) || "Quelqu'un";

    switch (data.type) {
      case 'follow':
        return `👤 ${username} a commencé à vous suivre !`;
      case 'like':
        return `❤️ ${username} a aimé votre post`;
      case 'retweet':
        return `🔄 ${username} a partagé votre post`;
      case 'reponse':
        return `💬 ${username} a répondu à votre post`;
      case 'mention':
        return `🔔 ${username} vous a mentionné dans un post`;
      case 'signet':
        return `🔖 ${username} a ajouté votre post à ses favoris`;
      default:
        return `🔔 Nouvelle notification de ${username}`;
    }
  };

  // Surveille le token dans les cookies toutes les secondes
  useEffect(() => {
    const cookieInterval = setInterval(() => {
      const currentToken = Cookies.get('token') || null;
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    return () => clearInterval(cookieInterval);
  }, [token]);

  // Configurer le socket uniquement si un token est présent
  useEffect(() => {
    if (!token) {
      // Si le token n'est plus présent, déconnecter le socket s'il l'est
      if (socket.connected) {
        socket.disconnect();
        setIsConnected(false);
        console.log('Token absent, socket déconnecté');
      }
      return;
    }

    // Si le token est présent, définir les écouteurs et connecter le socket
    const onConnect = () => {
      setIsConnected(true);
      console.log('Socket.IO connecté');
      // Récupérer les données utilisateur depuis le localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            socket.emit('authenticate', user.id);
            console.log('Socket authentifié pour l\'utilisateur', user.id);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket.IO déconnecté');
    };

    const onNotification = (data: NotificationData) => {
      console.log('Notification reçue:', data);
      const message = formatNotificationMessage(data);
      showNotification(message, data.type as any);
    };

    // Attacher les écouteurs
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);

    // Si déjà connecté, authentifier immédiatement, sinon tenter de se connecter
    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    // Nettoyage lors du démontage ou changement de token
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
    };
  }, [token]);

  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />

      {/* Style personnalisé pour les notifications */}
      <style jsx global>{`
        .notification-follow {
          background-color: #e8f4fd !important;
          border-left: 5px solid #3498db !important;
        }
        .notification-like {
          background-color: #ffe8ec !important;
          border-left: 5px solid #e74c3c !important;
        }
        .notification-retweet {
          background-color: #e8fdf0 !important;
          border-left: 5px solid #2ecc71 !important;
        }
        .notification-reponse {
          background-color: #f0e8fd !important;
          border-left: 5px solid #9b59b6 !important;
        }
        .notification-mention {
          background-color: #fdf8e8 !important;
          border-left: 5px solid #f39c12 !important;
        }
        .notification-signet {
          background-color: #e8fdfa !important;
          border-left: 5px solid #1abc9c !important;
        }
      `}</style>
    </>
  );
};

export default Notification;
