import Cookies from 'js-cookie';

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FollowingUser {
  _id: string;
  username: string;
  hashtag: string;
  pdp: string; // Photo de profil
  premium?: boolean;
}

interface FollowingResponse {
  success: boolean;
  count: number;
  data: FollowingUser[];
}

/**
 * Récupère les abonnements de l'utilisateur actuellement connecté
 */
export const getMyFollowing = async (): Promise<FollowingUser[]> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour voir vos abonnements');
    }
    
    const response = await fetch(`${API_URL}/api/user/follow/me/following`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération de vos abonnements');
    }

    const data: FollowingResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de vos abonnements:', error);
    throw error;
  }
};