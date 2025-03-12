import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface simplifiée pour définir la structure des données d'un post
export interface CreatePostData {
  texte: string;
}

// Interface pour la réponse de l'API
export interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    texte: string;
    createdAt: string;
    // Autres propriétés retournées par l'API
  };
}

/**
 * Fonction pour créer un nouveau post
 * @param postData - Les données du post à créer (uniquement le texte)
 * @returns Une promesse avec la réponse de l'API
 */
export const createPost = async (
  postData: CreatePostData
): Promise<CreatePostResponse> => {
  try {
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/post/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(postData), // Envoie uniquement {texte: "..."}
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la création du post");
    }

    return {
      success: true,
      message: "Post créé avec succès",
      data: data.data,
    };
  } catch (error) {
    console.error("Erreur de création de post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors de la création du post",
    };
  }
};