import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Récupère les posts paginés depuis l'API
 * @param page Numéro de la page
 * @returns Les données de l'API
 */
export const getPosts = async (page: number = 1,) => {
  try {
    // Utilisation de js-cookie pour récupérer le token
    const token = Cookies.get('token');
    if (!token) {
      return {
        success: false,
        message: "Vous devez être connecté pour voir les posts."
      };
    }

    const response = await fetch(`${API_URL}/post/getAllPosts?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    return {
      success: false,
      message: "Erreur lors de la récupération des posts",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};