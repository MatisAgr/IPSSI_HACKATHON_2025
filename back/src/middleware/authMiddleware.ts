// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/userModel';

// Interface pour étendre Request avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Configuration pour JWT
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // À configurer dans .env
export const JWT_EXPIRES_IN = '7d'; // Token valide pour 7 jours

/**
 * Génère un JWT token pour un utilisateur
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Middleware pour protéger les routes
 * Vérifie si le token est valide et attache l'utilisateur à la requête
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Récupérer le token du cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Vérifier si le token existe
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Non autorisé, veuillez vous connecter'
      });
      return;
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; iat: number; exp: number };

      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      // Attacher l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
      return;
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant l\'authentification',
      error: (error as Error).message
    });
  }
};
