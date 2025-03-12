import { Request, Response } from 'express';
import Notification from '../models/notificationModel';
import { IUser } from '../models/userModel';

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Récupère les notifications non lues d'un utilisateur
 * @route GET /api/notifications/unread
 * @access Private
 */
export const getUnreadNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const notifications = await Notification.find({
      user_id: req.user._id,
      read: false
    })
    .sort({ createdAt: -1 })
    .populate('actor_id', 'username hashtag pdp')
    .populate('post_id', 'texte');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: (error as Error).message
    });
  }
};

/**
 * Récupère toutes les notifications d'un utilisateur
 * @route GET /api/notifications
 * @access Private
 */
export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const notifications = await Notification.find({
      user_id: req.user._id
    })
    .sort({ createdAt: -1 })
    .populate('actor_id', 'username hashtag pdp')
    .populate('post_id', 'texte');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: (error as Error).message
    });
  }
};

/**
 * Marque les notifications comme lues
 * @route PUT /api/notifications/read
 * @access Private
 */
export const markNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Non autorisé, veuillez vous connecter"
      });
      return;
    }

    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      res.status(400).json({
        success: false,
        message: "Les IDs des notifications sont requis"
      });
      return;
    }

    // Mettre à jour toutes les notifications spécifiées
    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        user_id: req.user._id
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marquées comme lues"
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: (error as Error).message
    });
  }
};