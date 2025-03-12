import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface FollowCountResponse {
  success: boolean;
  message?: string;
  data?: {
    followers: number;
    following: number;
  };
}

/**
 * Récupère le nombre d'abonnés et d'abonnements de l'utilisateur connecté
 * @returns Une promesse avec les compteurs de follow
 */
export const getMyFollowCount = async (): Promise<FollowCountResponse> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/user/follow/me/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération des compteurs de follow");
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des compteurs de follow:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite"
    };
  }
};