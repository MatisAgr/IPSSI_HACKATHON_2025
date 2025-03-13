// src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

export const socket: Socket = io('http://localhost:5000', {
  autoConnect: false, // Empêche la connexion automatique; vous contrôlez quand connecter
  withCredentials: true,
});
