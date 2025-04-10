import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiTrendingUp, FiBell,
  FiMessageSquare, FiBookmark, FiSearch,
  FiUsers, FiChevronDown
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

  const navigate = useNavigate();

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('user'); // 'user', 'post', 'tag'
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);

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

// Déclarez une référence pour le numéro de page
const pageRef = useRef(1);

const loadMorePosts = useCallback(async () => {
  if (isLoading || loadingRef.current || !hasMore) return;

  setIsLoading(true);
  loadingRef.current = true;

  try {
    console.log(`🔄 Chargement des posts - page ${pageRef.current}`);
    const response = await getPosts(pageRef.current);
    console.log("Réponse complète:", response);

    if (!response.success) {
      console.error('❌ Erreur lors du chargement des posts:', response.message);
      setHasMore(false);
      return;
    }

    // Vérifiez ici que vous récupérez bien le bon tableau de posts
    const postsArray = response.data.posts || [];
    console.log("Posts array:", postsArray);

    if (postsArray.length === 0) {
      console.log('📭 Aucun nouveau post trouvé');
      setHasMore(false);
      return;
    }

    console.log(`✅ ${postsArray.length} posts récupérés`);

    const formattedPosts = postsArray.map(({ post, stats }) => ({
      id: post._id || `post-${Date.now()}-${Math.random()}`,
      user: {
        name: post.author?.username || 'Utilisateur',
        username: post.author?.hashtag || 'user',
        avatar: post.author?.pdp || `https://randomuser.me/api/portraits/lego/1.jpg`,
        premium: post.author?.premium || false
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

    // Ajoutez les nouveaux posts aux anciens
    setPosts(prevPosts => [...prevPosts, ...formattedPosts]);

    // Mettez à jour la pagination si disponible
    if (response.data.pagination) {
      setHasMore(response.data.pagination.hasMore);
      console.log(`📄 Pagination: page ${response.data.pagination.page}/${response.data.pagination.pages}, hasMore: ${response.data.pagination.hasMore}`);
    }

    // Incrémentez la page pour le prochain appel
    pageRef.current += 1;

  } catch (error) {
    console.error("❌ Erreur lors du chargement des posts:", error);
    setHasMore(false);
  } finally {
    setTimeout(() => {
      setIsLoading(false);
      loadingRef.current = false;
    }, 300);
  }
}, [hasMore, formatTimeAgo, isLoading]);


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

  // Fonction pour gérer la recherche
  const handleSearch = (query: string, type: string) => {
    console.log(`Recherche de type ${type}: "${query}"`);
    
    if (type === 'tag' && query) {
      const cleanTag = query.startsWith('#') ? query.substring(1) : query;
    navigate(`/feed/search?q=${encodeURIComponent(cleanTag)}&type=tag`);
    } else if (type === 'user' && query) {
      const cleanUser = query.startsWith('@') ? query.substring(1) : query;
      navigate(`/user/${cleanUser}`);
    } else if (type === 'post' && query) {
      navigate(`/feed/search?q=${encodeURIComponent(query)}&type=post`);
    } else {
      navigate(`/feed/search?q=${encodeURIComponent(query)}&type=${type}`);
    }
  }

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

            {/* Sidebar droite - masquée sur mobile et tablette - chargement lazy */}
            <div className="hidden lg:block lg:col-span-2 h-full pb-6">
              <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)]">
                {/* Recherche - haute priorité */}
                <motion.div
                  className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-visible shadow-lg relative z-[100]" // Augmentation du z-index à 100 et position relative
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 50 }}
                >
                  <div className="p-4">
                    {/* Champ de recherche */}
                    <div className="flex items-center bg-white bg-opacity-30 rounded-full px-4 py-2">
                      <FiSearch className="w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder={`Rechercher ${searchType === 'user' ? 'un utilisateur' :
                            searchType === 'post' ? 'un post' :
                              'un hashtag'
                          }`}
                        className="flex-1 bg-transparent border-0 outline-none focus:ring-0 px-3 text-indigo-900 placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Sélecteur de type de recherche */}
                    <div className="mt-3 flex justify-between items-center relative">
                      <div className="text-xs text-indigo-900 opacity-70">Type de recherche :</div>
                      <div className="relative">
                        <div
                          className="flex items-center gap-1 text-indigo-600 cursor-pointer select-none bg-white bg-opacity-30 rounded-full px-3 py-1"
                          onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
                        >
                          <span className="text-sm font-medium">
                            {searchType === 'user' ? 'Utilisateur' :
                              searchType === 'post' ? 'Post' :
                                'Hashtag'}
                          </span>
                          <FiChevronDown className={`w-4 h-4 transition-transform ${isSearchTypeOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Menu déroulant - déplacé en dehors des divs imbriquées pour améliorer le contexte d'empilement */}
                    {isSearchTypeOpen && (
                      <div className="absolute right-4 mt-2 w-36 py-1 bg-white rounded-lg shadow-xl z-[999]"> {/* z-index très élevé et shadow-xl */}
                        <div
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${searchType === 'user' ? 'bg-indigo-100 text-indigo-800' : ''}`}
                          onClick={() => {
                            setSearchType('user');
                            setIsSearchTypeOpen(false);
                          }}
                        >
                          Utilisateur
                        </div>
                        <div
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${searchType === 'post' ? 'bg-indigo-100 text-indigo-800' : ''}`}
                          onClick={() => {
                            setSearchType('post');
                            setIsSearchTypeOpen(false);
                          }}
                        >
                          Post
                        </div>
                        <div
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${searchType === 'tag' ? 'bg-indigo-100 text-indigo-800' : ''}`}
                          onClick={() => {
                            setSearchType('tag');
                            setIsSearchTypeOpen(false);
                          }}
                        >
                          Hashtag
                        </div>
                      </div>
                    )}

                    {/* Bouton de recherche */}
                    {searchQuery.length > 0 && (
                      <button
                        className="mt-3 w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors cursor-pointer"
                        onClick={() => {
                          console.log(`Recherche de type ${searchType}: "${searchQuery}"`);
                          handleSearch(searchQuery, searchType);
                        }}
                      >
                        Rechercher
                      </button>
                    )}
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