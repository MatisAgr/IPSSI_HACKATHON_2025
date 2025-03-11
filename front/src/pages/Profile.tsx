import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserCard } from '../components/Cards/UserCard';
import { ProfileSidebar } from '../components/Menu/ProfileSidebar';
import PostCard from '../components/Cards/PostCard';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('posts');

    // Données factices pour l'utilisateur
    const user = {
        name: 'Nom de fou',
        username: '@nomdefou',
        bio: 'Bio de fou',
        followers: '2,456',
        following: '867',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg', // URL d'image par défaut
        bannerImage: 'image de bannière',
        joinDate: 'Mars 2025'
    };

    // Création de posts factices
    const fakePosts = [
        {
            id: 1,
            user: {
                name: user.name,
                username: user.username.replace('@', ''), // On enlève le @ car le composant l'ajoute déjà
                avatar: user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg",
                verified: true
            },
            content: "Je travaille sur un nouveau projet qui utilise React et Tailwind CSS. C'est incroyable ce qu'on peut faire rapidement avec ces technologies ! #ReactJS #TailwindCSS #webdev",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80",
            timestamp: "il y a 3h",
            stats: {
                comments: 12,
                retweets: 5,
                likes: 23
            }
        },
        {
            id: 2,
            user: {
                name: user.name,
                username: user.username.replace('@', ''),
                avatar: user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg",
                verified: true
            },
            content: "Les hackathons sont une excellente façon d'apprendre et de se challenger. Qui est partant pour le prochain ? #hackathon #coding #challenge",
            timestamp: "il y a 6h",
            stats: {
                comments: 8,
                retweets: 2,
                likes: 15
            },
            isLiked: true
        },
        {
            id: 3,
            user: {
                name: user.name,
                username: user.username.replace('@', ''),
                avatar: user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg",
                verified: true
            },
            content: "Je viens de finir le dernier cours sur la programmation fonctionnelle. Ces concepts sont vraiment puissants une fois qu'on les maîtrise !",
            image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            timestamp: "il y a 1j",
            stats: {
                comments: 20,
                retweets: 12,
                likes: 45
            },
            isRetweeted: true
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-400 to-purple-100">
            {/* Page principale */}
            <div className="flex-1 max-w-6xl mx-auto bg-white shadow-sm">
                {/* Carte utilisateur */}
                <UserCard user={user} />

                {/* Section principale avec sidebar et contenu */}
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 p-4">
                        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 p-4 border-l">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {activeTab === 'posts' && 'Posts'}
                            {activeTab === 'replies' && 'Réponses'}
                            {activeTab === 'retweets' && 'Retweets'}
                            {activeTab === 'likes' && 'J\'aime'}
                            {activeTab === 'bookmarks' && 'Signets'}
                        </h2>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Contenu selon l'onglet actif */}
                                {activeTab === 'posts' && (
                                    <>
                                        {/* Liste des posts */}
                                        {fakePosts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                user={post.user}
                                                content={post.content}
                                                image={post.image}
                                                timestamp={post.timestamp}
                                                stats={post.stats}
                                                isLiked={post.isLiked}
                                                isRetweeted={post.isRetweeted}
                                                // isBookmarked={post.isBookmarked}
                                            />
                                        ))}
                                    </>
                                )}
                                
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