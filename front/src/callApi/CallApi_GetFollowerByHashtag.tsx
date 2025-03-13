import Cookies from 'js-cookie';

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FollowerUser {
  _id: string;
  username: string;
  hashtag: string;
  pdp: string; // Photo de profil
  premium?: boolean;
}

interface FollowerResponse {
  success: boolean;
  count: number;
  data: FollowerUser[];
}

/**
 * Récupère les abonnés d'un utilisateur spécifique via son hashtag
 * @param hashtag Le hashtag de l'utilisateur dont on veut récupérer les abonnés
 */
export const getFollowerByHashtag = async (hashtag: string): Promise<FollowerUser[]> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      throw new Error('Vous devez être connecté pour voir les abonnés');
    }
    
    console.log(`📡 Récupération des abonnés pour l'utilisateur ${hashtag}`);
    
    const response = await fetch(`${API_URL}/user/followers/${hashtag}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur lors de la récupération des abonnés de ${hashtag}`);
    }

    const data: FollowerResponse = await response.json();
    console.log(`✅ ${data.count} abonnés récupérés pour ${hashtag}`);
    
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des abonnés de ${hashtag}:`, error);
    return []; // Retourne un tableau vide en cas d'erreur au lieu de propager l'erreur
  }
};