import { io } from "../index";
import Notification from "../models/notificationModel";

/**
 * Envoie une notification en temps réel et la sauvegarde en base de données
 */
export const sendNotification = async (
  userId: string,
  type: string,
  postId?: string,
  actorId?: string
) => {
  try {
    // Créer la notification dans la base de données
    const notification = await Notification.create({
      user_id: userId,
      post_id: postId || null,
      type,
      actor_id: actorId || null,
      read: false
    });

    // Récupérer la notification avec les données peuplées pour l'envoyer
    const populatedNotification = await Notification.findById(notification._id)
      .populate('user_id', 'username hashtag pdp')
      .populate('actor_id', 'username hashtag pdp')
      .populate('post_id', 'texte');

    // Envoyer la notification en temps réel via Socket.IO
    io.to(`user:${userId}`).emit("notification", populatedNotification);
    
    return notification;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    throw error;
  }
};