import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FollowerUser {
  _id: string;
  username: string;
  hashtag: string;
  pdp: string;
  premium?: boolean;
}

interface FollowerResponse {
  success: boolean;
  count: number;
  data: FollowerUser[];
}

/**
 * Récupère les abonnés de l'utilisateur actuellement connecté
 */
export const getMyFollowers = async (): Promise<FollowerUser[]> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour voir vos abonnés');
    }
    
    const response = await fetch(`${API_URL}/user/follow/me/followers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération de vos abonnés');
    }

    const data: FollowerResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de vos abonnés:', error);
    throw error;
  }
};