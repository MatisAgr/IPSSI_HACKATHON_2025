import Cookies from 'js-cookie';
import { UserProfileData } from './CallApi_GetMyProfile';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface pour la réponse de l'API lors d'une mise à jour de profil
export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfileData;
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param profileData Données du profil à mettre à jour (username, bio, pdp, pdb, premium)
 * @returns Une promesse avec la réponse de l'API
 */
export const updateUserProfile = async (profileData: Partial<UserProfileData>): Promise<UpdateProfileResponse> => {
  try {
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    
    if (!token) {
      console.error("Token manquant pour la mise à jour du profil");
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    console.log("Envoi des données pour mise à jour:", profileData);

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
      console.error("Erreur API:", data);
      throw new Error(data.message || "Erreur lors de la mise à jour du profil");
    }

    console.log("Profil mis à jour avec succès:", data);
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