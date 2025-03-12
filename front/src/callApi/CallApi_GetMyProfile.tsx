import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface pour les données du profil utilisateur
export interface UserProfileData {
  id: string;
  username: string;
  hashtag: string;
  bio: string;
  email: string;
  premium: boolean;
  pdp: string; // Photo de profil
  pdb: string; // Photo de bannière
  age?: number;
  sexe?: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface pour la réponse de l'API
export interface GetProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfileData;
}

/**
 * Récupère les informations de profil de l'utilisateur connecté
 * @returns Une promesse avec la réponse de l'API
 */
export const getMyProfile = async (): Promise<GetProfileResponse> => {
  try {
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/user/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération du profil");
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error("Erreur de récupération du profil:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors de la récupération de votre profil",
    };
  }
};

/**
 * Met à jour le profil de l'utilisateur
 * @param profileData Données du profil à mettre à jour
 * @returns Une promesse avec la réponse de l'API
 */
export const updateProfile = async (profileData: Partial<UserProfileData>): Promise<GetProfileResponse> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/user/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour du profil");
    }

    return {
      success: true,
      message: "Profil mis à jour avec succès",
      data: data.data
    };
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors de la mise à jour de votre profil",
    };
  }
};

/**
 * Récupère le profil d'un utilisateur par son ID
 * @param userId ID de l'utilisateur à récupérer
 * @returns Une promesse avec la réponse de l'API
 */
export const getUserProfile = async (userId: string): Promise<GetProfileResponse> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération du profil utilisateur");
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error("Erreur de récupération du profil utilisateur:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors de la récupération du profil utilisateur",
    };
  }
};