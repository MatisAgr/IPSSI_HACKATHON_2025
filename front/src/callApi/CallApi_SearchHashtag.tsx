import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Recherche les posts par tag/hashtag
 * @param tag Le tag à rechercher (sans le #)
 * @param page Numéro de la page
 * @returns Les posts associés au tag
 */
export const searchPostsByTag = async (tag: string, page: number = 1) => {
  try {
    // Utilisation de js-cookie pour récupérer le token
    const token = Cookies.get('token');
    if (!token) {
      return {
        success: false,
        message: "Vous devez être connecté pour voir les posts."
      };
    }

    // Nettoyer le tag en enlevant le # s'il est présent
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;

    // URL adaptée pour correspondre à la route /search/posts/:tag
    const response = await fetch(`${API_URL}/search/posts/${cleanTag}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la recherche de posts avec le tag #${tag}:`, error);
    return {
      success: false,
      message: "Erreur lors de la recherche de posts par hashtag",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Recherche des utilisateurs par hashtag
 */
export const searchUsersByHashtag = async (hashtag: string, page: number = 1) => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      return {
        success: false,
        message: "Vous devez être connecté pour chercher des utilisateurs."
      };
    }

    // Nettoyer le hashtag en enlevant le @ ou # s'il est présent
    const cleanHashtag = hashtag.startsWith('@') || hashtag.startsWith('#') 
      ? hashtag.substring(1) 
      : hashtag;

    // URL adaptée pour correspondre à la route /search/user/:hashtag
    const response = await fetch(`${API_URL}/search/user/${cleanHashtag}?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la recherche d'utilisateurs:`, error);
    return {
      success: false,
      message: "Erreur lors de la recherche d'utilisateurs",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Cette fonction n'est pas définie dans les routes fournies.
 * Si vous souhaitez l'utiliser, assurez-vous d'implémenter la route correspondante côté back-end.
 */
export const searchPostsByText = async (query: string, page: number = 1) => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      return {
        success: false,
        message: "Vous devez être connecté pour chercher des posts."
      };
    }

    // Note: Cette route n'est pas définie dans les routes fournies
    // Vous devrez peut-être adapter cette URL ou implémenter cette route dans le backend
    const response = await fetch(`${API_URL}/search/posts?query=${encodeURIComponent(query)}&page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la recherche de posts:`, error);
    return {
      success: false,
      message: "Erreur lors de la recherche de posts",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};