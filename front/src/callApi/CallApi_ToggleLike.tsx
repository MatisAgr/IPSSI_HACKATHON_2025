import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


/**
 * Fonction pour ajouter ou retirer un like sur un post
 * @param postId ID du post à liker ou unliker
 * @returns Objet avec le résultat de l'opération et le statut actuel du like
 */
export const toggleLike = async (postId: string) => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non authentifié. Veuillez vous connecter.",
        isLiked: false
      };
    }
    
    // Appel à l'API pour basculer le like
    const response = await fetch(`${API_URL}/like/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    // Analyse de la réponse
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la modification du like');
    }

    return {
      success: true,
      message: data.message,
      isLiked: data.isLiked
    };

  } catch (error) {
    console.error("Erreur lors du toggle like:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue",
      isLiked: false
    };
  }
};

export default {
  toggleLike,
};