import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiTrendingUp, FiBell,
    FiMessageSquare, FiBookmark, FiSearch,
    FiUsers, FiChevronDown, FiHash,
    FiFileText, FiUserCheck
} from 'react-icons/fi';
import InfiniteScroll from '../utils/InfiniteScroll';
import PostCard from '../components/Cards/PostCard';
import CreatePostButton from '../components/Buttons/CreatePostButton';
import { getMyProfile } from '../callApi/CallApi_GetMyProfile';
import { searchPostsByTag, searchPostsByText, searchUsersByHashtag } from '../callApi/CallApi_SearchHashtag';
import TrendingTopic from '../components/Feed/TrendingTopic';
import UserSuggestion from '../components/Feed/UserSuggestion';
import { LazyMotion, domAnimation } from 'framer-motion';

export default function FeedTag() {
    // Paramètres d'URL et navigation
    const { tag } = useParams<{ tag: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Détermine si nous sommes en mode recherche
    const isSearchMode = location.pathname.includes('/search');
    const searchQuery = isSearchMode ? searchParams.get('q') || '' : '';
    const searchTypeFromUrl = isSearchMode ? searchParams.get('type') || 'tag' : 'tag';

    // États pour les données
    const [posts, setPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // États pour la recherche
    const [searchLocalQuery, setSearchLocalQuery] = useState('');
    const [searchType, setSearchType] = useState(searchTypeFromUrl); // 'user', 'post', 'tag'
    const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);

    // État pour l'affichage
    const [displayTitle, setDisplayTitle] = useState(tag || searchQuery || 'Recherche');
    const [displayType, setDisplayType] = useState('tag'); // 'tag', 'user', 'post'

    // Autres états
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        name: "Chargement...",
        username: "utilisateur",
        profileImage: "https://randomuser.me/api/portraits/lego/1.jpg",
        verified: false
    });
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

    // Fonction pour charger les résultats selon le type
    const loadResults = useCallback(async () => {
        if (isLoading || loadingRef.current || !hasMore) return;

        setIsLoading(true);
        loadingRef.current = true;

        try {
            let response;
            let searchTerm = isSearchMode ? searchQuery : tag;

            if (!searchTerm) {
                setHasMore(false);
                return;
            }

            // Nettoyage du terme de recherche
            searchTerm = searchTerm.startsWith('#') || searchTerm.startsWith('@')
                ? searchTerm.substring(1)
                : searchTerm;

            console.log(`🔄 Chargement des résultats pour "${searchTerm}" - page ${page} - type: ${searchTypeFromUrl}`);

            if (isSearchMode) {
                // Mode recherche: utiliser le type de recherche depuis l'URL
                if (searchTypeFromUrl === 'tag') {
                    response = await searchPostsByTag(searchTerm, page);
                    setDisplayType('tag');
                } else if (searchTypeFromUrl === 'user') {
                    response = await searchUsersByHashtag(searchTerm, page);
                    setDisplayType('user');
                } else if (searchTypeFromUrl === 'post') {
                    response = await searchPostsByText(searchTerm, page);
                    setDisplayType('post');
                }
            } else {
                // Mode standard: recherche par tag depuis l'URL
                response = await searchPostsByTag(searchTerm, page);
                setDisplayType('tag');
            }

            console.log("Réponse complète:", response);

            if (!response || !response.success) {
                console.error(`❌ Erreur lors du chargement des résultats:`, response?.message || 'Erreur inconnue');
                setHasMore(false);
                return;
            }

            // Traitement différent selon le type de résultat
            if (displayType === 'user') {
                // Traitement des résultats d'utilisateurs
                const usersArray = response.data?.users || [];
                if (usersArray.length === 0) {
                    setHasMore(false);
                    return;
                }

                const formattedUsers = usersArray.map((user: any) => ({
                    id: user._id || `user-${Date.now()}-${Math.random()}`,
                    name: user.username || 'Utilisateur',
                    username: user.hashtag || 'user',
                    avatar: user.pdp || `https://randomuser.me/api/portraits/lego/1.jpg`,
                    premium: user.premium || false
                }));

                setUsers(prevUsers => [...prevUsers, ...formattedUsers]);
            } else {
                // Traitement des résultats de posts (tag ou post)
                // Adapter en fonction de la structure reçue
                let postsArray = [];

                if (response.data?.posts) {
                    // Structure directe avec tableau de posts
                    postsArray = response.data.posts;
                } else if (Array.isArray(response.data)) {
                    // Cas où les posts sont directement dans data
                    postsArray = response.data;
                } else {
                    console.error("❌ Structure de données inattendue:", response.data);
                    setHasMore(false);
                    return;
                }

                if (postsArray.length === 0) {
                    setHasMore(false);
                    return;
                }

                // Traiter chaque post en fonction de sa structure
                const formattedPosts = postsArray.map((postData: any) => {
                    // Déterminer si nous avons un objet {post, stats} ou directement un post
                    const post = postData.post || postData;
                    const stats = postData.stats || {};

                    return {
                        id: post._id || `post-${Date.now()}-${Math.random()}`,
                        user: {
                            name: post.author?.username || 'Utilisateur',
                            username: post.author?.hashtag || 'user',
                            avatar: post.author?.pdp || `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 8) + 1}.jpg`,
                            premium: post.author?.premium || false
                        },
                        content: post.texte || post.text || '',
                        image: post.media?.url || post.image || null,
                        timestamp: formatTimeAgo(new Date(post.createdAt || Date.now())),
                        stats: {
                            comments: stats?.replies || post.replies || post.commentCount || 0,
                            retweets: stats?.retweets || post.retweets || post.retweetCount || 0,
                            likes: stats?.likes || post.likes || post.likeCount || 0,
                            bookmarks: stats?.signets || post.signets || post.bookmarkCount || 0
                        },
                        isLiked: post.isLiked || false,
                        isRetweeted: post.isRetweeted || false,
                        isBookmarked: post.isBookmarked || false
                    };
                });

                setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
            }

            setPage(prevPage => prevPage + 1);

            // Adapter la gestion de la pagination
            if (response.data?.pagination) {
                setHasMore(response.data.pagination.hasMore);
            } else if (response.pagination) {
                setHasMore(response.pagination.hasMore);
            } else {
                // Si pas de pagination, supposer qu'il n'y a plus de résultats
                setHasMore(false);
            }

        } catch (error) {
            console.error(`❌ Erreur lors du chargement des résultats:`, error);
            setHasMore(false);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
                loadingRef.current = false;
            }, 300);
        }
    }, [page, hasMore, formatTimeAgo, tag, isSearchMode, searchQuery, searchTypeFromUrl, displayType]);

    useEffect(() => {
        // Réinitialiser les états pour une nouvelle recherche
        setPosts([]);
        setUsers([]);
        setPage(1);
        setHasMore(true);

        // Mise à jour du type de recherche local
        setSearchType(searchTypeFromUrl);

        // Mise à jour du titre d'affichage
        if (isSearchMode) {
            setDisplayTitle(searchQuery || 'Recherche');
        } else {
            setDisplayTitle(tag || 'Tag');
        }

        const initData = async () => {
            await loadUserProfile();

            if (!loadingRef.current) {
                await loadResults();
                setTimeout(() => setIsInitialized(true), 200);
            }
        };

        initData();
    }, [loadUserProfile, tag, isSearchMode, searchQuery, searchTypeFromUrl, navigate]);

    // Mise à jour de la recherche locale quand l'URL change
    useEffect(() => {
        if (isSearchMode) {
            setSearchLocalQuery(searchQuery);
        }
    }, [isSearchMode, searchQuery]);

    useEffect(() => {
        if (searchLocalQuery && searchLocalQuery.length > 2) {
            const timer = setTimeout(() => {
                navigate(`/feed/search?q=${encodeURIComponent(searchLocalQuery)}&type=${searchType}`, { replace: true });
                setDisplayTitle(searchLocalQuery);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [searchLocalQuery, searchType]);

    // Fonction pour gérer la recherche
    const handleSearch = (query: string, type: string) => {
        if (!query.trim()) return; // Éviter les recherches vides
    
        console.log(`Recherche de type ${type}: "${query}"`);
    
        // On garde l'affichage du terme tel que saisi par l'utilisateur
        const displayQuery = query;
        
        // Pour la recherche, on normalise le terme
        const normalizedQuery = query.toLowerCase().trim();
    
        if (type === 'tag' && normalizedQuery) {
            const cleanTag = normalizedQuery.startsWith('#') ? normalizedQuery.substring(1) : normalizedQuery;
            navigate(`/feed/search?q=${encodeURIComponent(cleanTag)}&type=tag`);
        } else if (type === 'user' && normalizedQuery) {
            const cleanUser = normalizedQuery.startsWith('@') ? normalizedQuery.substring(1) : normalizedQuery;
            navigate(`/user/${cleanUser}`);
        } else if (type === 'post' && normalizedQuery) {
            navigate(`/feed/search?q=${encodeURIComponent(normalizedQuery)}&type=post`);
        } else {
            navigate(`/feed/search?q=${encodeURIComponent(normalizedQuery)}&type=${type}`);
        }
        
        // Mettre à jour le titre d'affichage avec la version non normalisée pour une meilleure expérience utilisateur
        setDisplayTitle(displayQuery);
    }

    // Obtenir l'icône et le titre de la bannière selon le type d'affichage
    const getBannerContent = () => {
        if (isSearchMode) {
            if (searchTypeFromUrl === 'user') {
                return {
                    icon: <FiUserCheck className="w-7 h-7" />,
                    title: `Recherche d'utilisateurs: ${searchQuery}`,
                    description: "Découvrez les utilisateurs correspondant à votre recherche"
                };
            } else if (searchTypeFromUrl === 'post') {
                return {
                    icon: <FiFileText className="w-7 h-7" />,
                    title: `Recherche de posts: ${searchQuery}`,
                    description: "Publications correspondant à votre recherche"
                };
            } else {
                return {
                    icon: <FiHash className="w-7 h-7" />,
                    title: `${displayTitle}`,
                    description: "Découvrez les publications autour de ce hashtag"
                };
            }
        } else {
            return {
                icon: <FiHash className="w-7 h-7" />,
                title: `${displayTitle}`,
                description: "Découvrez les publications autour de ce hashtag"
            };
        }
    };

    const bannerContent = getBannerContent();

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container h-full mx-auto px-4">
                    {/* Bannière dynamique */}
                    <motion.div
                        className="bg-indigo-600 rounded-xl p-4 mb-6 text-white flex items-center shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <div className="flex items-center gap-3">
                            {bannerContent.icon}
                            <h1 className="text-2xl font-bold">{bannerContent.title}</h1>
                        </div>
                        <div className="ml-auto text-sm opacity-80">
                            {bannerContent.description}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 h-full">
                        {/* Sidebar gauche - masquée sur mobile */}
                        <div className="hidden md:block md:col-span-1 lg:col-span-2 h-full pb-6">

                        </div>

                        {/* Flux principal - uniquement scrollable */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 h-full pt-4">
                            <h1 className="sr-only">Résultats de recherche - {bannerContent.title}</h1>

                            <div className="h-[calc(100vh)] overflow-auto pb-20">
                                <InfiniteScroll
                                    loadMore={loadResults}
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
                                            <p>
                                                {displayType === 'user'
                                                    ? "Vous avez vu tous les utilisateurs correspondants ! 🎉"
                                                    : `Vous avez vu tous les résultats ${isSearchMode ? "de votre recherche" : `avec #${tag}`} ! 🎉`}
                                            </p>
                                        </div>
                                    }
                                    className="space-y-4"
                                >
                                    {/* Affichage conditionnel selon le type de recherche */}
                                    {displayType === 'user' ? (
                                        // Affichage des utilisateurs
                                        users.length === 0 && !isLoading ? (
                                            <div className="text-center py-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                                                <p className="text-gray-600">Aucun utilisateur trouvé pour cette recherche.</p>
                                            </div>
                                        ) : (
                                            users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="bg-white bg-opacity-50 rounded-xl p-4 transition-all hover:bg-opacity-70 cursor-pointer"
                                                    onClick={() => navigate(`/user/${user.username}`)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                                                        />
                                                        <div>
                                                            <div className="flex items-center">
                                                                <h3 className="font-medium text-indigo-900">{user.name}</h3>
                                                                {user.premium && (
                                                                    <span className="ml-1 text-indigo-600">
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">@{user.username}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <button className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm hover:bg-indigo-600 transition-colors">
                                                                Suivre
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        // Affichage des posts
                                        posts.length === 0 && !isLoading ? (
                                            <div className="text-center py-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                                                <p className="text-gray-600">
                                                    {isSearchMode
                                                        ? "Aucun résultat trouvé pour cette recherche."
                                                        : `Aucun post avec #${tag} à afficher pour le moment.`}
                                                </p>
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
                                        )
                                    )}
                                </InfiniteScroll>
                            </div>
                        </div>

                        {/* Sidebar droite - masquée sur mobile et tablette - chargement lazy */}
                        <div className="hidden lg:block lg:col-span-2 h-full pb-6">
                            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)]">
                                {/* Recherche - haute priorité */}
                                <motion.div
                                    className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 overflow-visible shadow-lg relative z-[100]"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, type: "spring", stiffness: 50 }}
                                >
                                    <div className="p-4">
                                        {/* Champ de recherche avec loupe interactive */}
                                        <div className="flex items-center bg-white bg-opacity-30 rounded-full px-4 py-2">
                                            <motion.div
                                                animate={{
                                                    scale: searchLocalQuery.length > 0 ? 1.1 : 1,
                                                    color: searchLocalQuery.length > 0 ? "#4f46e5" : "#6b7280"
                                                }}
                                                whileHover={{
                                                    scale: searchLocalQuery.length > 0 ? 1.2 : 1.05,
                                                }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                onClick={() => {
                                                    if (searchLocalQuery.length > 0) {
                                                        handleSearch(searchLocalQuery, searchType);
                                                    }
                                                }}
                                                className={`${searchLocalQuery.length > 0 ? 'cursor-pointer' : 'cursor-default'} flex items-center justify-center w-8 h-8`}
                                            >
                                                <FiSearch className={`w-5 h-5 ${searchLocalQuery.length > 0 ? 'text-indigo-600' : 'text-gray-500'}`} />
                                            </motion.div>

                                            <input
                                                type="text"
                                                placeholder={`Rechercher ${searchType === 'user' ? 'un utilisateur' :
                                                    searchType === 'post' ? 'un post' :
                                                        'un hashtag'
                                                    }`}
                                                className="flex-1 bg-transparent border-0 outline-none focus:ring-0 px-3 text-indigo-900 placeholder-gray-500"
                                                value={searchLocalQuery}
                                                onChange={(e) => {
                                                    const newQuery = e.target.value;
                                                    setSearchLocalQuery(newQuery);
                                                    if (newQuery) setDisplayTitle(newQuery);
                                                }}
                                                onKeyDown={(e) => {
                                                    // Déclencher la recherche immédiatement quand l'utilisateur appuie sur Entrée
                                                    if (e.key === 'Enter' && searchLocalQuery.trim().length > 0) {
                                                        e.preventDefault();
                                                        handleSearch(searchLocalQuery, searchType);
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                            />

                                        </div>

                                    </div>
                                </motion.div>

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