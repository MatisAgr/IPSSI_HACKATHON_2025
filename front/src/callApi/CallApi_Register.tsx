// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface pour les données d'inscription
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  gender: string;
  birthdate: string;
  interests?: string[];
}

// Interface pour la réponse de l'API
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

/**
 * Inscrit un nouvel utilisateur
 * @param userData Les données d'inscription
 * @returns Les informations de l'utilisateur créé
 */
export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de l\'inscription');
  }
};