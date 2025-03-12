import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface pour les données d'un post
export interface PostData {
  id: string;
  texte: string;
  author: {
    _id: string;
    username: string;
    hashtag?: string;
    pdp?: string; // Photo de profil
  };
  createdAt: string;
  media?: {
    type: string;
    url: string;
  };
  tags?: string[];
}

// Interface pour la réponse de l'API
export interface GetMyPostsResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: PostData[];
}

/**
 * Récupère les posts de l'utilisateur connecté
 * @returns Une promesse avec la réponse de l'API
 */
export const getMyPosts = async (): Promise<GetMyPostsResponse> => {
  try {
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté",
        data: []
      };
    }

    const response = await fetch(`${API_URL}/post/getMyPosts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération de vos posts");
    }

    return {
      success: true,
      message: data.message || "Posts récupérés avec succès",
      count: data.count,
      data: data.data || []
    };
  } catch (error) {
    console.error("Erreur de récupération des posts:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors de la récupération des posts",
      data: []
    };
  }
};
