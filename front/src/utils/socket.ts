import { io } from "socket.io-client";

//objectif de ce fichier : gérer la connexion WS avec socketIO
const SOCKET_SERVER_URL = "http://localhost:5000"; // URL décidée pour notre backend

export const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true,
  transports: ["websocket"],
});
