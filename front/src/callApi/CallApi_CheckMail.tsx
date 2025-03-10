// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Vérifie si un email existe déjà dans la base de données
 * @param email L'adresse email à vérifier
 * @returns Un objet indiquant si l'email existe
 */
export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la vérification de l\'email');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la vérification');
  }
};