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
  console.log(`🔑 Génération d'un nouveau token pour l'utilisateur ID: ${userId}`);
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Middleware pour protéger les routes
 * Vérifie si le token est valide et attache l'utilisateur à la requête
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log(`🛡️  Middleware d'authentification activé - Route: ${req.originalUrl}`);
  
  try {
    let token: string | undefined;

    // Récupérer le token du header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log(`🔐 Token trouvé dans les headers`);
    }

    // Vérifier si le token existe
    if (!token) {
      console.log(`❌ Pas de token fourni - Accès refusé`);
      res.status(401).json({
        success: false,
        message: 'Non autorisé, veuillez vous connecter'
      });
      return;
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; iat: number; exp: number };
      console.log(`✅ Token vérifié avec succès - UserID: ${decoded.id}`);
      console.log(`⏱️  Token expire le: ${new Date(decoded.exp * 1000).toLocaleString()}`);

      // Récupérer l'utilisateur depuis la base de données
      console.log(`🔍 Recherche de l'utilisateur dans la base de données...`);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log(`❌ Utilisateur non trouvé en base de données pour l'ID: ${decoded.id}`);
        res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      // Attacher l'utilisateur à la requête
      console.log(`👤 Utilisateur authentifié: ${user.username || user.email}`);
      req.user = user;
      next();
    } catch (error) {
      console.log(`🚫 Erreur de vérification du token: ${(error as Error).message}`);
      res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
      return;
    }
  } catch (error) {
    console.error(`💥 Erreur critique d'authentification: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant l\'authentification',
      error: (error as Error).message
    });
  }
  console.log('----------------------------------');
};