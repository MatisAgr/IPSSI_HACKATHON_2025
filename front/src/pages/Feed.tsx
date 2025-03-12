import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiTrendingUp, FiBell,
  FiMessageSquare, FiBookmark, FiSearch,
  FiHeart, FiRepeat, FiMessageCircle, FiShare2,
  FiUsers
} from 'react-icons/fi';
import InfiniteScroll from '../utils/InfiniteScroll';
import PostCard from '../components/Cards/PostCard';
import CreatePostButton from '../components/Buttons/CreatePostButton';

// Composant TrendingTopic pour la sidebar
const TrendingTopic = ({ topic, posts, category }: any) => (
  <div className="p-3 cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all rounded-xl">
    <div className="text-xs text-gray-500">{category}</div>
    <div className="font-semibold text-indigo-900">{topic}</div>
    <div className="text-xs text-gray-500">{posts} posts</div>
  </div>
);

// Composant UserSuggestion pour la sidebar
const UserSuggestion = ({ name, username, avatar }: any) => (
  <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all rounded-xl">
    <img
      src={avatar}
      alt={name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-indigo-900 truncate">{name}</div>
      <div className="text-xs text-gray-500 truncate">@{username}</div>
    </div>
    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
      Suivre
    </button>
  </div>
);

export default function Feed() {
  // États pour les données
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString();
  };

  // Données d'exemple pour l'utilisateur connecté
  const currentUser = {
    name: "Marie Dupont",
    username: "marie_d",
    profileImage: "https://randomuser.me/api/portraits/women/23.jpg",
    verified: true
  };

  // Fonction pour charger plus de posts
  const loadMorePosts = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Simulation de chargement API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPosts = Array(5).fill(0).map((_, i) => ({
        id: `${page}-${i}`,
        user: {
          name: ["Sophie Martin", "Thomas Bernard", "Emma Dubois", "Lucas Petit", "Jade Moreau"][Math.floor(Math.random() * 5)],
          username: ["sophiem", "tom_b", "emma_d", "lucas_p", "jade_m"][Math.floor(Math.random() * 5)],
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50)}.jpg`,
          verified: Math.random() > 0.7
        },
        content: [
          "Aujourd'hui, j'ai fait une découverte incroyable en travaillant sur mon projet #IA ! Le potentiel est énorme 😍",
          "Qui d'autre est excité par les dernières innovations en #blockchain ? C'est fascinant de voir comment cette technologie évolue !",
          "Je viens de terminer ma présentation pour la conférence de demain. Nerveux mais prêt à partager mes idées sur l'#IntelligenceArtificielle",
          "La vue depuis mon bureau aujourd'hui est magnifique ! Parfait pour booster la créativité #WorkFromHome",
          "Je recommande vivement ce livre sur le #MachineLearning, il m'a vraiment aidé à comprendre les concepts complexes.",
          "Quelqu'un a déjà essayé ce nouveau framework JavaScript ? J'hésite à l'intégrer dans mon projet #webdev",
          "Enfin terminé ce projet qui m'a pris des mois ! Tellement satisfait du résultat final #accomplissement",
          "Je réfléchis à changer de carrière et me diriger vers la #DataScience. Des conseils ?",
          "@marie_d merci pour ton aide sur le projet ! On forme une super équipe 👏"
        ][Math.floor(Math.random() * 9)],
        image: Math.random() > 0.6 ? [
          "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1420&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1470&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1472&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1476&auto=format&fit=crop"
        ][Math.floor(Math.random() * 4)] : undefined,
        timestamp: formatTimeAgo(new Date(Date.now() - Math.floor(Math.random() * 604800000))), // 7 jours max
        stats: {
          comments: Math.floor(Math.random() * 50),
          retweets: Math.floor(Math.random() * 30),
          likes: Math.floor(Math.random() * 100)
        },
        isLiked: Math.random() > 0.7,
        isRetweeted: Math.random() > 0.8,
        isBookmarked: Math.random() > 0.9
      }));

      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setPage(prevPage => prevPage + 1);

      // Arrêter le chargement après 5 pages pour l'exemple
      if (page >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les premiers posts au montage du composant
  useEffect(() => {
    loadMorePosts();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container h-full mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 h-full">
          {/* Sidebar gauche - masquée sur mobile */}
          <div className="hidden md:block md:col-span-1 lg:col-span-2 h-full pb-6">
            {/* Explorer section */}
            <motion.div
              className="sticky top-24 bg-white bg-opacity-20 backdrop-blur-lg p-4 rounded-2xl border border-white border-opacity-20 shadow-lg h-auto max-h-[calc(100vh-120px)] mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-indigo-900 mb-4 px-3">Explorer</h2>

              <nav className="space-y-1">
                <div className="flex items-center gap-3 p-3 bg-indigo-100 bg-opacity-50 rounded-xl text-indigo-900 font-medium">
                  <FiArrowRight className="w-5 h-5" />
                  Pour vous
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white hover:bg-opacity-30 rounded-xl cursor-pointer transition-all">
                  <FiTrendingUp className="w-5 h-5" />
                  Tendances
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white hover:bg-opacity-30 rounded-xl cursor-pointer transition-all">
                  <FiBell className="w-5 h-5" />
                  Notifications
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white hover:bg-opacity-30 rounded-xl cursor-pointer transition-all">
                  <FiMessageSquare className="w-5 h-5" />
                  Messages
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white hover:bg-opacity-30 rounded-xl cursor-pointer transition-all">
                  <FiBookmark className="w-5 h-5" />
                  Signets
                </div>
              </nav>
            </motion.div>

            {/* Qui suivre section */}
            <motion.div
              className="sticky top-[calc(25rem)] bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: -20, y: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-indigo-900 p-4 border-b border-gray-200 border-opacity-20 flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Qui suivre
              </h2>
              <div>
                <UserSuggestion
                  name="Laura Martin"
                  username="laura_dev"
                  avatar="https://randomuser.me/api/portraits/women/12.jpg"
                />
                <UserSuggestion
                  name="Thomas Durand"
                  username="thomasd_tech"
                  avatar="https://randomuser.me/api/portraits/men/32.jpg"
                />
                <UserSuggestion
                  name="Sophie Bernard"
                  username="sophie_b"
                  avatar="https://randomuser.me/api/portraits/women/45.jpg"
                />
              </div>
              <div className="p-4 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                Voir plus
              </div>
            </motion.div>
          </div>

          {/* Flux principal - uniquement scrollable */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 h-full">
            <h1 className="sr-only">Flux d'actualités</h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full overflow-y-auto pb-20 scrollbar-hide"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              <InfiniteScroll
                loadMore={loadMorePosts}
                hasMore={hasMore}
                isLoading={isLoading}
                loader={
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
                endMessage={
                  <div className="text-center py-6 text-gray-500 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <p>Vous avez vu tous les posts ! 🎉</p>
                  </div>
                }
                className="space-y-4"
              >
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard
                      user={post.user}
                      content={post.content}
                      image={post.image}
                      timestamp={post.timestamp}
                      stats={post.stats}
                      isLiked={post.isLiked}
                      isRetweeted={post.isRetweeted}
                      isBookmarked={post.isBookmarked}
                    />
                  </motion.div>
                ))}
              </InfiniteScroll>
            </motion.div>
          </div>

          {/* Sidebar droite - masquée sur mobile et tablette */}
          <div className="hidden lg:block lg:col-span-2 h-full pb-6">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)]">
              {/* Recherche */}
              <motion.div
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="p-4">
                  <div className="flex items-center bg-white bg-opacity-30 rounded-full px-4 py-2">
                    <FiSearch className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Rechercher"
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 px-3 text-indigo-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Tendances */}
              <motion.div
                className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-indigo-900 p-4 border-b border-gray-200 border-opacity-20">
                  Tendances pour vous
                </h2>
                <div>
                  <TrendingTopic topic="#IntelligenceArtificielle" posts="2 325" category="Technologie" />
                  <TrendingTopic topic="#DéveloppementWeb" posts="1 456" category="Programmation" />
                  <TrendingTopic topic="#MachineLearning" posts="892" category="Data Science" />
                  <TrendingTopic topic="#FrontEnd" posts="720" category="Développement" />
                  <TrendingTopic topic="#ReactJS" posts="684" category="JavaScript" />
                </div>
                <div className="p-4 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                  Voir plus
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de création de post */}
      <CreatePostButton user={currentUser} />
    </div>
  );
}