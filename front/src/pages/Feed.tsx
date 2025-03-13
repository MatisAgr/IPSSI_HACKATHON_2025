import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiTrendingUp, FiBell,
  FiMessageSquare, FiBookmark, FiSearch,
  FiUsers
} from 'react-icons/fi';
import InfiniteScroll from '../utils/InfiniteScroll';
import PostCard from '../components/Cards/PostCard';
import CreatePostButton from '../components/Buttons/CreatePostButton';
import { getMyProfile } from '../callApi/CallApi_GetMyProfile';
import { getPosts } from '../callApi/CallApi_GetPosts';
import TrendingTopic from '../components/Feed/TrendingTopic';
import UserSuggestion from '../components/Feed/UserSuggestion';
import { LazyMotion, domAnimation } from 'framer-motion';

// à faire en fonction des nombres de posts avec ce tag
const trendingTopics = [
  { topic: "#IntelligenceArtificielle", posts: "2 325", category: "Technologie" },
  { topic: "#DéveloppementWeb", posts: "1 456", category: "Programmation" },
  { topic: "#MachineLearning", posts: "892", category: "Data Science" },
  { topic: "#FrontEnd", posts: "720", category: "Développement" },
  { topic: "#ReactJS", posts: "684", category: "JavaScript" }
];

// à faire en fonction des gens qui ont le même centre d'intérêt
const userSuggestions = [
  { name: "Laura Martin", username: "laura_dev", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "Thomas Durand", username: "thomasd_tech", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Sophie Bernard", username: "sophie_b", avatar: "https://randomuser.me/api/portraits/women/45.jpg" }
];

export default function Feed() {
  // États pour les données
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // État pour l'initialisation - utile pour les animations retardées
  const [isInitialized, setIsInitialized] = useState(false);

  // État pour l'utilisateur connecté
  const [currentUser, setCurrentUser] = useState({
    name: "Chargement...",
    username: "utilisateur",
    profileImage: "https://randomuser.me/api/portraits/lego/1.jpg", // Image par défaut
    verified: false
  });

  // État pour suivre le statut de chargement du profil
  const [profileLoading, setProfileLoading] = useState(true);

  // Fonction pour formater le temps écoulé - utilisez useMemo pour éviter les recalculs inutiles
  const formatTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString();
  }, []);

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setCurrentUser({
          name: userData.username, // On utilise le nom d'utilisateur comme nom
          username: userData.hashtag, // Le hashtag comme identifiant
          profileImage: userData.pdp || "https://randomuser.me/api/portraits/lego/1.jpg", // Utiliser pdp ou image par défaut
          verified: userData.premium // Les utilisateurs premium sont vérifiés
        });
      } else {
        console.warn("Impossible de récupérer le profil utilisateur:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadingRef = useRef(false);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || loadingRef.current || !hasMore) return;
  
    setIsLoading(true);
    loadingRef.current = true;
  
    try {
      console.log(`🔄 Chargement des posts - page ${page}`);
      
      const response = await getPosts(page);
      console.log("Réponse complète:", response);
      
      if (!response.success) {
        console.error('❌ Erreur lors du chargement des posts:', response.message);
        setHasMore(false);
        return;
      }
      
      // CORRECTION: La structure est response.data.posts et non response.data?.posts
      const postsArray = response.data?.posts || [];
      console.log("Posts array:", postsArray);
      
      if (postsArray.length === 0) {
        console.log('📭 Aucun nouveau post trouvé');
        setHasMore(false);
        return;
      }
      
      console.log(`✅ ${postsArray.length} posts récupérés`);
      
      const formattedPosts = postsArray.map(({ post, stats }: any) => ({
        id: post._id || `post-${Date.now()}-${Math.random()}`,
        user: {
          name: post.author?.username || 'Utilisateur',
          username: post.author?.hashtag || 'user',
          avatar: post.author?.pdp || `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 8) + 1}.jpg`,
          premium: post.author?.premium || false  // Utilisation de premium au lieu de verified
        },
        content: post.texte || post.text || '',
        image: post.media?.url || post.image || null,
        timestamp: formatTimeAgo(new Date(post.createdAt || Date.now())),
        stats: {
          comments: stats.replies || 0,
          retweets: stats.retweets || 0,
          likes: stats.likes || 0,
          bookmarks: stats.signets || 0
        },
        isLiked: post.isLiked || false, 
        isRetweeted: post.isRetweeted || false,
        isBookmarked: post.isBookmarked || false
      }));
      
      setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
      setPage(prevPage => prevPage + 1);
      
      // CORRECTION: Utiliser la bonne structure pour la pagination
      if (response.data?.pagination) {
        setHasMore(response.data.pagination.hasMore);
        console.log(`📄 Pagination: page ${response.data.pagination.page}/${response.data.pagination.pages}, hasMore: ${response.data.pagination.hasMore}`);
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des posts:", error);
      setHasMore(false);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        loadingRef.current = false;
      }, 300);
    }
  }, [page, hasMore, formatTimeAgo]);

  // Initialisation des données au montage du composant
  useEffect(() => {
    const initData = async () => {
      await loadUserProfile();
      
      // Rester synchrone et éviter les multiples appels
      if (!loadingRef.current) {
        await loadMorePosts();
        setTimeout(() => setIsInitialized(true), 200);
      }
    };
    
    initData();
    // Note importante: ne pas inclure loadMorePosts dans les dépendances
  }, [loadUserProfile]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container h-full mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 h-full">
            {/* Sidebar gauche - masquée sur mobile */}
            <div className="hidden md:block md:col-span-1 lg:col-span-2 h-full pb-6">
              {/* Conteneur sticky unique qui contient les deux sections */}
              <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] hide-scrollbar">
                {/* Explorer section - sans sticky individuel */}
                <motion.div
                  className="bg-white bg-opacity-20 backdrop-blur-lg p-4 rounded-2xl border border-white border-opacity-20 shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 50 }}
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
            
                {/* Qui suivre section - sans sticky individuel et dans le même conteneur */}
                {isInitialized && (
                  <motion.div
                    className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                  >
                    <h2 className="text-xl font-bold text-indigo-900 p-4 border-b border-gray-200 border-opacity-20 flex items-center gap-2">
                      <FiUsers className="w-5 h-5" />
                      Qui suivre
                    </h2>
                    <div>
                      {userSuggestions.map((user, index) => (
                        <UserSuggestion
                          key={`user-${index}`}
                          name={user.name}
                          username={user.username}
                          avatar={user.avatar}
                        />
                      ))}
                    </div>
                    <div className="p-4 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                      Voir plus
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Flux principal - uniquement scrollable */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 h-full pt-4 ">
              <h1 className="sr-only">Flux d'actualités</h1>
            
              <div
                className="h-[calc(100vh)] overflow-auto pb-20"
              >
                
                <InfiniteScroll
                  loadMore={loadMorePosts}
                  hasMore={hasMore}
                  isLoading={isLoading}
                  initialLoad={false}
                  threshold={300}
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
                  {posts.length === 0 && !isLoading ? (
                    <div className="text-center py-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                      <p className="text-gray-600">Aucun post à afficher pour le moment.</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        user={post.user}
                        content={post.content}
                        image={post.image}
                        timestamp={post.timestamp}
                        stats={post.stats}
                        isLiked={post.isLiked}
                        isRetweeted={post.isRetweeted}
                        isBookmarked={post.isBookmarked}
                      />
                    ))
                  )}
                </InfiniteScroll>
              </div>
            </div>

            {/* Sidebar droite - masquée sur mobile et tablette - chargement différé */}
            <div className="hidden lg:block lg:col-span-2 h-full pb-6">
              <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)]">
                {/* Recherche - haute priorité */}
                <motion.div
                  className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 50 }}
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

                {/* Tendances - chargement différé */}
                <AnimatePresence>
                  {isInitialized && (
                    <motion.div
                      className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-hidden shadow-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, type: "spring", stiffness: 50 }}
                    >
                      <h2 className="text-xl font-bold text-indigo-900 p-4 border-b border-gray-200 border-opacity-20">
                        Tendances pour vous
                      </h2>
                      <div>
                        {trendingTopics.map((topic, index) => (
                          <TrendingTopic
                            key={`trend-${index}`}
                            topic={topic.topic}
                            posts={topic.posts}
                            category={topic.category}
                          />
                        ))}
                      </div>
                      <div className="p-4 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">
                        Voir plus
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de création de post avec le profil réel de l'utilisateur */}
        {!profileLoading && <CreatePostButton user={currentUser} />}
      </div>
    </LazyMotion>
  );
}