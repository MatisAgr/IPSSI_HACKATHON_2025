import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ToggleFollowResponse {
  success: boolean;
  isFollowing?: boolean;
  message?: string;
}

export const toggleFollow = async (targetUserId: string): Promise<ToggleFollowResponse> => {
  console.log("🔄 Appel API toggleFollow pour:", targetUserId);
  
  try {
    const token = Cookies.get('token');
    
    if (!token) {
      console.error("❌ Erreur: Token manquant");
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    // Vérifiez que l'URL est correcte (ajustez selon votre configuration de routes)
    const url = `${API_URL}/user/follow/toggle`;
    console.log("🌐 URL de l'API:", url);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ followingId: targetUserId })
    });

    const data = await response.json();
    console.log("📊 Données reçues:", data);

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors du toggle follow');
    }

    return {
      success: true,
      isFollowing: data.isFollowing,
      message: data.message
    };
  } catch (error) {
    console.error('💥 Erreur toggle follow:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
};