import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { UserCard } from '../components/Cards/UserCard';
import { ProfileSidebar } from '../components/Menu/ProfileSidebar';
import PostCard from '../components/Cards/PostCard';

// Importer les APIs nécessaires
// import { getUserProfile, UserProfileData } from '../callApi/CallApi_GetMyProfile';
// import { getUserPosts } from '../callApi/CallApi_GetUserPosts';
import { getFollowCount } from '../callApi/CallApi_CountFollow';
import { toggleFollow } from '../callApi/CallApi_ToggleFollow';
import { checkFollowStatus } from '../callApi/CallApi_CheckFollow';

export default function ProfileUser() {
    const { hashtag } = useParams<{ hashtag: string }>();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour les données de profil
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [followCounts, setFollowCounts] = useState({ followers: '0', following: '0' });
    const [isFollowing, setIsFollowing] = useState(false);

    // Formatage des timestamps et dates comme dans Profile.tsx
    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) {
            return `il y a ${diffMins}m`;
        } else if (diffHours < 24) {
            return `il y a ${diffHours}h`;
        } else if (diffDays < 7) {
            return `il y a ${diffDays}j`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatJoinDate = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('fr-FR', { month: 'long' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    // Charger le profil utilisateur en fonction du hashtag
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!hashtag) return;
            
            setProfileLoading(true);
            setProfileError(null);

            try {
                // Récupérer les données du profil par hashtag
                const response = await getUserProfile(hashtag);
                const followResponse = await getFollowCount(response.data?.id || '');
                const followStatusResponse = await checkFollowStatus(response.data?.id || '');

                // Traitement du profil
                if (response.success && response.data) {
                    setUserProfile(response.data);
                } else {
                    setProfileError(response.message || "Impossible de charger ce profil");
                    return;
                }

                // Traitement des compteurs de followers
                if (followResponse.success && followResponse.data) {
                    setFollowCounts({
                        followers: followResponse.data.followers.toString(),
                        following: followResponse.data.following.toString()
                    });
                }

                // Vérifier si on suit déjà cet utilisateur
                if (followStatusResponse.success) {
                    setIsFollowing(followStatusResponse.isFollowing);
                }

            } catch (err) {
                setProfileError("Une erreur est survenue lors du chargement du profil");
                console.error("Erreur lors du chargement du profil:", err);
            } finally {
                setProfileLoading(false);
            }
        };

        loadUserProfile();
    }, [hashtag]);

    // Charger les posts de l'utilisateur
    useEffect(() => {
        const loadPosts = async () => {
            if (!userProfile?.id) return;
            
            setIsLoading(true);
            setError(null);

            try {
                const response = await getUserPosts(userProfile.id);

                if (response.success) {
                    setUserPosts(response.data || []);
                } else {
                    setError(response.message || "Une erreur est survenue lors du chargement des posts.");
                }
            } catch (err) {
                setError("Impossible de récupérer les posts. Veuillez réessayer plus tard.");
                console.error("Erreur lors du chargement des posts:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (userProfile) {
            loadPosts();
        }
    }, [userProfile]);

    // Gérer le suivi/désabonnement
    const handleToggleFollow = async () => {
        if (!userProfile?.id) return;

        try {
            const response = await toggleFollow(userProfile.id);
            
            if (response.success) {
                setIsFollowing(response.isFollowing);
                
                // Mettre à jour le compteur de followers
                setFollowCounts(prev => ({
                    ...prev,
                    followers: (parseInt(prev.followers) + (response.isFollowing ? 1 : -1)).toString()
                }));
            }
        } catch (error) {
            console.error("Erreur lors du changement de statut de suivi:", error);
        }
    };

    // Préparer les données pour UserCard
    const userCardData = userProfile ? {
        name: userProfile.username,
        username: "@" + userProfile.hashtag,
        bio: userProfile.bio || "Aucune biographie",
        followers: followCounts.followers || '0',
        following: followCounts.following || '0',   
        profileImage: userProfile.pdp || "",
        coverImage: userProfile.pdb || "",
        joinDate: formatJoinDate(userProfile.createdAt),
        isPremium: userProfile.premium,
        isFollowing: isFollowing,
        onFollowToggle: handleToggleFollow
    } : {
        name: 'Chargement...',
        username: '@...',
        bio: 'Chargement du profil...',
        followers: '0',
        following: '0',
        profileImage: '',
        coverImage: '',
        joinDate: ''
    };

    // Formater les posts pour PostCard
    const formattedPosts = userPosts.map(post => ({
        id: post.id || post._id,
        user: {
            name: userProfile?.username || 'Utilisateur',
            username: userProfile?.hashtag || '',
            avatar: userProfile?.pdp || "",
            premium: userProfile?.premium || false
        },
        content: post.texte || post.content || '',
        image: post.media?.url || post.image || undefined,
        timestamp: formatTimestamp(new Date(post.createdAt)),
        stats: {
            comments: post.stats?.replies || 0,
            retweets: post.stats?.retweets || 0,
            likes: post.stats?.likes || 0
        }
    }));

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-400 to-purple-100">
            <div className="flex-1 max-w-6xl mx-auto bg-white shadow-sm">
                {profileLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : profileError ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg m-4">
                        <p>{profileError}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                        >
                            Retour
                        </button>
                    </div>
                ) : (
                    <UserCard
                        user={userCardData}
                        isOtherUser={true}
                    />
                )}

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 p-4">
                        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                    <div className="flex-1 p-4 border-l">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {activeTab === 'posts' && 'Posts'}
                            {activeTab === 'replies' && 'Réponses'}
                            {activeTab === 'retweets' && 'Retweets'}
                            {activeTab === 'likes' && 'J\'aime'}
                            {activeTab === 'bookmarks' && 'Signets'}
                        </h2>

                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                                {/* Contenu selon l'onglet actif */}
                                {activeTab === 'posts' && (
                                    <>
                                        {isLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : error ? (
                                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                                                <p>{error}</p>
                                            </div>
                                        ) : formattedPosts.length === 0 ? (
                                            <div className="bg-gray-50 p-8 rounded-lg text-center">
                                                <p className="text-gray-600 mb-4">Cet utilisateur n'a pas encore publié de posts.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {formattedPosts.map(post => (
                                                    <PostCard
                                                        id={post.id}
                                                        key={post.id}
                                                        user={post.user}
                                                        content={post.content}
                                                        image={post.image}
                                                        timestamp={post.timestamp}
                                                        stats={post.stats}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                                
                                {/* Les autres onglets comme dans Profile.tsx */}
                                {(activeTab === 'replies' || activeTab === 'retweets' || activeTab === 'likes' || activeTab === 'bookmarks') && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>En cours de développement...</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}