import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserCard } from '../components/Cards/UserCard';
import { ProfileSidebar } from '../components/Menu/ProfileSidebar';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('posts');

    // Données factices pour l'utilisateur
    const user = {
        name: 'Nom de fou',
        username: '@nomdefou',
        bio: 'Bio de fou',
        followers: '2,456',
        following: '867',
        profileImage: 'image de pdp',
        bannerImage: 'image de bannière',
        joinDate: 'Mars 2025'
    };

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

                                    {/* Liste de faux posts pour l'instant */}
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                                <div className="flex items-start space-x-3">
                                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-200">
                                                        <img 
                                                            src={user.profileImage}
                                                            alt="Avatar" 
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-bold">{user.name}</span>
                                                            <span className="text-gray-500 text-sm ml-2">{user.username}</span>
                                                            <span className="text-gray-500 text-sm ml-2">· il y a 3h</span>
                                                        </div>
                                                        <p className="mt-1">Exemple de post {item} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. #tailwind #react</p>
                                                        <div className="flex mt-3 text-gray-500 text-sm space-x-6">
                                                            <span>12 commentaires</span>
                                                            <span>5 retweets</span>
                                                            <span>23 j'aime</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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