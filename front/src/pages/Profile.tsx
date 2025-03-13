import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import CreatePostButton from '../components/Buttons/CreatePostButton';
import { UserCard } from '../components/Cards/UserCard';
import { ProfileSidebar } from '../components/Menu/ProfileSidebar';
import PostCard from '../components/Cards/PostCard';
import UpdateUserModal from '../components/Modals/UpdateUserModal';

import { getMyPosts, PostData } from '../callApi/CallApi_GetMyPosts';
import { getMyProfile, UserProfileData } from '../callApi/CallApi_GetMyProfile';
import { getMyFollowCount, FollowCountResponse } from '../callApi/CallApi_CountMyFollow';

import { getMyFollowers } from '../callApi/CallApi_GetFollower';
import { getMyFollowing } from '../callApi/CallApi_GetFollowing';
import { toggleFollow } from '../callApi/CallApi_ToggleFollow';


export default function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Nouvel état pour les données de profil
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [followCounts, setFollowCounts] = useState({ followers: '0', following: '0' });
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [followsLoading, setFollowsLoading] = useState(true);


    // Fonction pour formater les timestamps
    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else if (diffDays < 7) {
            return `${diffDays}j`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Formatage de la date d'inscription
    const formatJoinDate = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('fr-FR', { month: 'long' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    const handleUserClick = (userId: string, hashtag: string) => {
        console.log(`Navigation vers le profil de ${hashtag} (ID: ${userId})`);
        navigate(`/user/${hashtag}`);
    };

    // Charger le profil utilisateur
    useEffect(() => {
        const loadUserProfile = async () => {
            setProfileLoading(true);
            setProfileError(null);
            setFollowsLoading(true);

            try {
                // Charger le profil et les compteurs simultanément
                const [profileResponse, followCountResponse] = await Promise.all([
                    getMyProfile(),
                    getMyFollowCount()
                ]);

                // Traiter la réponse du profil
                if (profileResponse.success && profileResponse.data) {
                    setUserProfile(profileResponse.data);
                    console.log("Profile chargé:", profileResponse.data);
                } else {
                    setProfileError(profileResponse.message || "Impossible de charger votre profil");
                }

                // Traiter la réponse des compteurs de follow
                if (followCountResponse.success && followCountResponse.data) {
                    setFollowCounts({
                        followers: followCountResponse.data.followers.toString(),
                        following: followCountResponse.data.following.toString()
                    });
                    console.log("Compteurs de follow récupérés:", followCountResponse.data);
                }

                // Charger les données d'abonnés et d'abonnements
                try {
                    const [followersData, followingData] = await Promise.all([
                        getMyFollowers(),
                        getMyFollowing()
                    ]);

                    // Transformer les données pour correspondre à l'interface User
                    const mappedFollowers = followersData.map(follower => ({
                        id: follower._id,
                        username: follower.username,
                        hashtag: follower.hashtag,
                        profileImage: follower.pdp || "https://randomuser.me/api/portraits/lego/1.jpg",
                        premium: follower.premium || false,
                        isFollowing: true // Par défaut, nos abonnés peuvent nous suivre
                    }));

                    const mappedFollowing = followingData.map(follow => ({
                        id: follow._id,
                        username: follow.username,
                        hashtag: follow.hashtag,
                        profileImage: follow.pdp || "https://randomuser.me/api/portraits/lego/1.jpg",
                        premium: follow.premium || false,
                        isFollowing: true // Par défaut, nous suivons nos abonnements
                    }));

                    setFollowers(mappedFollowers);
                    setFollowing(mappedFollowing);
                    console.log("Abonnés chargés:", mappedFollowers.length);
                    console.log("Abonnements chargés:", mappedFollowing.length);
                    
                } catch (followError) {
                    console.error("Erreur lors du chargement des abonnés/abonnements:", followError);
                    // Utiliser les données mock en cas d'erreur
                    setFollowers([]);
                    setFollowing([]);
                } finally {
                    setFollowsLoading(false);
                }

            } catch (err) {
                setProfileError("Une erreur est survenue lors du chargement de votre profil");
                console.error("Erreur lors du chargement du profil:", err);
            } finally {
                setProfileLoading(false);
            }
        };

        loadUserProfile();
    }, []);

    // Charger les posts de l'utilisateur au chargement du composant
    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getMyPosts();
                console.log("Posts:" + response.data);

                if (response.success) {
                    setUserPosts(response.data);
                } else {
                    setError(response.message || "Une erreur est survenue lors du chargement de vos posts.");
                }
            } catch (err) {
                setError("Impossible de récupérer vos posts. Veuillez réessayer plus tard.");
                console.error("Erreur lors du chargement des posts:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPosts();
    }, []);

    const handleProfileUpdate = (updatedData: Partial<UserProfileData>) => {
        setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
    };

    const handleFollowToggle = async (userId: string) => {
        try {
            console.log("Toggle follow pour l'utilisateur:", userId);
            const response = await toggleFollow(userId);
            
            if (response.success) {
                // Mettre à jour l'état du suivi dans les listes
                setFollowers(prev => 
                    prev.map(user => 
                        user.id === userId 
                            ? { ...user, isFollowing: !user.isFollowing }
                            : user
                    )
                );
                
                setFollowing(prev => 
                    prev.map(user => 
                        user.id === userId 
                            ? { ...user, isFollowing: !user.isFollowing }
                            : user
                    )
                );
                
                console.log(`Statut de suivi mis à jour pour ${userId}:`, response.isFollowing);
            }
        } catch (error) {
            console.error("Erreur lors du toggle follow:", error);
        }
    };

    const userCardData = userProfile ? {
        name: userProfile.username,
        username: "@" + userProfile.hashtag,
        bio: userProfile.bio || "Aucune biographie",
        followers: followCounts.followers || 'n/a',
        following: followCounts.following || 'n/a',   
        profileImage: userProfile.pdp || "",
        coverImage: userProfile.pdb || "",
        joinDate: formatJoinDate(userProfile.createdAt),
        isPremium: userProfile.premium
    } : {
        // Données pendant le chargement
        name: 'Chargement...',
        username: '@...',
        bio: 'Chargement de votre profil...',
        followers: '0',
        following: '0',
        profileImage: '',
        coverImage: '',
        joinDate: ''
    };

    // Formater les posts pour composant PostCard
    const formattedPosts = userPosts.map(post => ({
        id: post.id,
        user: {
            name: post.author.username,
            username: post.author.username,
            avatar: post.author.pdp || "",
            premium: false
        },
        content: post.texte,
        image: post.media?.type === 'image' ? post.media.url : undefined,
        timestamp: formatTimestamp(new Date(post.createdAt)),
        stats: {
            comments: 0,
            retweets: 0,
            likes: 0
        }
    }));

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-400 to-purple-100">
            <CreatePostButton user={userCardData} />
            <div className="flex-1 max-w-6xl mx-auto bg-white shadow-sm">
            {profileLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : profileError ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg m-4">
                        <p>{profileError}</p>
                        <button
                            onClick={() => getMyProfile().then(res => {
                                if (res.success && res.data) setUserProfile(res.data);
                            })}
                            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : (
                    <UserCard
                        user={userCardData}
                        onSettingsClick={() => setIsUpdateModalOpen(true)}
                        userFeatureProps={{
                            followersData: followers,
                            followingData: following,
                            followsLoading: followsLoading,
                            onFollowToggle: handleFollowToggle,
                            onUserClick: (userId, hashtag) => handleUserClick(userId, hashtag)
                        }}
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
                                                <button
                                                    onClick={() => getMyPosts().then(res => {
                                                        if (res.success) setUserPosts(res.data);
                                                    })}
                                                    className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                                                >
                                                    Réessayer
                                                </button>
                                            </div>
                                        ) : formattedPosts.length === 0 ? (
                                            <div className="bg-gray-50 p-8 rounded-lg text-center">
                                                <p className="text-gray-600 mb-4">Vous n'avez pas encore publié de posts.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {formattedPosts.map(post => (
                                                    <PostCard
                                                        id={post.id}
                                                        key={post.id}
                                                        user={userProfile ? {
                                                            name: userProfile.username,
                                                            username: userProfile.hashtag,
                                                            avatar: userProfile.pdp || "",
                                                            premium: userProfile.premium
                                                        } : {
                                                            name: 'Chargement...',
                                                            username: '...',
                                                            avatar: '',
                                                            premium: false
                                                        }}
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

                                {activeTab === 'replies' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>En cours de dev...</p>
                                    </div>
                                )}

                                {activeTab === 'retweets' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>En cours de dev...</p>
                                    </div>
                                )}

                                {activeTab === 'likes' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>En cours de dev...</p>
                                    </div>
                                )}

                                {activeTab === 'bookmarks' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>En cours de dev...</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <UpdateUserModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onUpdate={handleProfileUpdate}
                    userData={userProfile}
                />
            </div>
        </div>
    );
}