import React, { useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import pour la gestion du WS
import { socket } from '../utils/socket';


const Notification: React.FC = () => {
  
  // Fonction pour afficher la notification
  const showNotification = (msg: string) => {
    toast(msg, {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
  };

  // Écouter les événements WebSocket
  useEffect(() => {
    socket.on("newFollower", (data) => {
      showNotification(`👤 ${data.username} a commencé à vous suivre !`);
    });

    socket.on("newMessage", (data) => {
      showNotification(`📩 Nouveau message de ${data.sender}: "${data.message}"`);
    });

    return () => {
      socket.off("newFollower");
      socket.off("newMessage");
    };
  }, []);

  return (
    <div>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </div>
  );
};

export default Notification;
