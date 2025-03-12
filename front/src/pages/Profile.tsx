import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import CreatePostButton from '../components/Buttons/CreatePostButton';
import { UserCard } from '../components/Cards/UserCard';
import { ProfileSidebar } from '../components/Menu/ProfileSidebar';
import PostCard from '../components/Cards/PostCard';
import { getMyPosts, PostData } from '../callApi/CallApi_GetMyPosts';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Données factices pour l'utilisateur
    const user = {
        name: 'Nom de fou',
        username: 'nomdefou',
        bio: 'Bio de fou',
        followers: '2,456',
        following: '867',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        bannerImage: 'image de bannière',
        joinDate: 'Mars 2025'
    };

    // Fonction pour formater les timestamps - DÉPLACÉE AVANT SON UTILISATION
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

    // Charger les posts de l'utilisateur au chargement du composant
    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getMyPosts();

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

    // Formater les posts pour les adapter au composant PostCard - DÉPLACÉ APRÈS formatTimestamp
    const formattedPosts = userPosts.map(post => ({
        id: post.id,
        user: {
            name: post.author.username, // On utilise le username comme nom par défaut
            username: post.author.username,
            avatar: post.author.pdp || "https://randomuser.me/api/portraits/men/32.jpg",
            verified: false // À adapter selon votre modèle
        },
        content: post.texte,
        image: post.media?.type === 'image' ? post.media.url : undefined,
        timestamp: formatTimestamp(new Date(post.createdAt)),
        stats: {
            comments: 0, // Ces statistiques ne sont pas disponibles dans votre API
            retweets: 0,
            likes: 0
        }
    }));

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-400 to-purple-100">
            {/* Le reste du code reste inchangé */}
            <CreatePostButton user={user} />
            <div className="flex-1 max-w-6xl mx-auto bg-white shadow-sm">
                <UserCard user={user} />
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

                        {/* Le reste du JSX reste inchangé */}
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
                                                <button
                                                    onClick={() => document.getElementById('create-post-button')?.click()}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                >
                                                    Créer votre premier post
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {formattedPosts.map(post => (
                                                    <PostCard
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

                                {/* Les autres onglets restent inchangés */}
                                {activeTab === 'replies' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>Affichage des réponses dans une bulle grise.</p>
                                    </div>
                                )}

                                {activeTab === 'retweets' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>Affichage des retweets dans une bulle grise.</p>
                                    </div>
                                )}

                                {activeTab === 'likes' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>Affichage des likes dans une bulle grise.</p>
                                    </div>
                                )}

                                {activeTab === 'bookmarks' && (
                                    <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                        <p>Affichage des signets dans une bulle grise.</p>
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