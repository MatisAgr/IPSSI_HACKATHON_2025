import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const toggleFollow = async (targetUserId: string): Promise<ToggleFollowResponse> => {
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    const response = await fetch(`${API_URL}/follow/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ followingId: targetUserId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors du toggle follow');
    }

    return {
      success: true,
      isFollowing: data.isFollowing,
      message: data.message
    };
  } catch (error) {
    console.error('Erreur toggle follow:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
};