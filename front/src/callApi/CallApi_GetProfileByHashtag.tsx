import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Interface pour les données complètes du profil avec posts et stats de followers
export interface UserProfileWithPostsData extends UserProfileData {
  posts?: any[];
  followerCount?: number;
  followingCount?: number;
}

// Interface pour la réponse de l'API avec profil complet
export interface GetProfileWithPostsResponse {
  success: boolean;
  message?: string;
  data?: {
    user: UserProfileData;
    posts: any[];
    followerCount: number;
    followingCount: number;
  };
}

/**
 * Récupère le profil d'un utilisateur par son hashtag
 * @param hashtag Hashtag de l'utilisateur à récupérer (sans le @ si présent)
 * @returns Une promesse avec la réponse de l'API
 */
export const getProfileByHashtag = async (hashtag: string): Promise<GetProfileWithPostsResponse> => {
  try {
    // Nettoyer le hashtag en retirant @ si présent
    const cleanHashtag = hashtag.startsWith('@') ? hashtag.substring(1) : hashtag;
    
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    
    if (!token) {
      return {
        success: false,
        message: "Non autorisé: vous n'êtes pas connecté"
      };
    }

    console.log(`🔍 Récupération du profil avec le hashtag: ${cleanHashtag}`);

    const response = await fetch(`${API_URL}/user/profile/${cleanHashtag}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Erreur de récupération: ${data.message}`);
      throw new Error(data.message || `Erreur lors de la récupération du profil @${cleanHashtag}`);
    }

    console.log(`✅ Profil récupéré avec succès: ${cleanHashtag}`);
    
    return {
      success: true,
      data: {
        user: data.data.user,
        posts: data.data.posts || [],
        followerCount: data.data.followerCount || 0,
        followingCount: data.data.followingCount || 0
      }
    };
  } catch (error) {
    console.error(`💥 Erreur de récupération du profil par hashtag:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : `Une erreur s'est produite lors de la récupération du profil @${hashtag}`,
    };
  }
};