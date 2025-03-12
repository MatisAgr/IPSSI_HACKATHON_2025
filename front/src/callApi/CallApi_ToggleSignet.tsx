import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fonction pour ajouter ou retirer un signet sur un post
 * @param postId ID du post à ajouter/supprimer des signets
 * @returns Objet avec le résultat de l'opération et le statut actuel du signet
 */
export const toggleSignet = async (postId: string) => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non authentifié. Veuillez vous connecter.",
        isBookmarked: false
      };
    }
    
    // Appel à l'API pour basculer le signet
    const response = await fetch(`${API_URL}/signet/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la modification du signet');
    }
    
    return {
      success: true,
      message: data.message,
      isBookmarked: data.isBookmarked
    };
    
  } catch (error) {
    console.error("Erreur lors du toggle signet:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue",
      isBookmarked: false
    };
  }
};

export default {
  toggleSignet,
};