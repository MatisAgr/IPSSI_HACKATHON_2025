// URL de base de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Interface pour la réponse de la demande de réinitialisation
 */
interface ForgetPasswordResponse {
  message: string;
}

/**
 * Fonction pour demander une réinitialisation de mot de passe
 */
export const forgotPassword = async (email: string): Promise<ForgetPasswordResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la demande de réinitialisation");
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};