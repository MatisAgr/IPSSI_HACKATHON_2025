import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fonction pour ajouter ou retirer un retweet sur un post
 * @param postId ID du post à retweeter ou annuler le retweet
 * @returns Objet avec le résultat de l'opération et le statut actuel du retweet
 */
export const toggleRetweet = async (postId: string) => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non authentifié. Veuillez vous connecter.",
        isRetweeted: false
      };
    }
    
    // Appel à l'API pour basculer le retweet
    const response = await fetch(`${API_URL}/retweet/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    // Analyse de la réponse
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la modification du retweet');
    }

    return {
      success: true,
      message: data.message,
      isRetweeted: data.isRetweeted
    };

  } catch (error) {
    console.error("Erreur lors du toggle retweet:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue",
      isRetweeted: false
    };
  }
};

export default {
  toggleRetweet,
};