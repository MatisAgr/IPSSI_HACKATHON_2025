interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// URL de base de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Fonction pour authentifier un utilisateur
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Erreur d'authentification");
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fonction pour demander une réinitialisation de mot de passe
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
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