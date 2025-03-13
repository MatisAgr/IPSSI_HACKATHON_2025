import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiLoader, FiInfo, FiArrowRight, FiCheck, FiSmile } from 'react-icons/fi';

import { getMyProfile, UserProfileData } from '../callApi/CallApi_GetMyProfile';
import { getPosts } from '../callApi/CallApi_GetPosts';
import WebcamEmotionCapture from '../utils/WebcamSnapshotRecorder';
import PostCard from '../components/Cards/PostCard';
import axios from 'axios';

// Constantes
const RECORDING_DURATION = 5000; // 5 secondes de capture
const EMOTION_API_URL = "http://10.74.0.54:8000/emotions";
const SNAPSHOTS_API_URL = "http://10.74.0.54:8000/snapshots";

// Post de secours si l'API échoue
const FALLBACK_POST = {
  id: "fallback-post-id",
  user: {
    name: "Utilisateur Test",
    username: "usertest",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    premium: false
  },
  content: "Ceci est un post de test pour l'analyse d'émotions. L'API de posts n'a pas pu être jointe, mais vous pouvez quand même tester la fonctionnalité d'analyse d'émotions.",
  image: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
  timestamp: "maintenant",
  stats: {
    comments: 0,
    retweets: 0,
    likes: 0
  }
};

// Interface pour les données d'émotion
interface EmotionData {
  user_id: string;
  post_id: string;
  emotion: string;
  created_at: string;
}

// Fonction pour obtenir l'emoji correspondant à l'émotion
const getEmotionEmoji = (emotion: string) => {
  const emotions: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    fearful: "😨",
    surprised: "😮",
    disgusted: "🤢",
    neutral: "😐",
    contempt: "😒"
  };
  
  return emotions[emotion.toLowerCase()] || "😐";
};

export default function EmotionTestPage() {
  // États pour les données
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le processus de test
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedSnapshots, setCapturedSnapshots] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<EmotionData | null>(null);
  const [emotionLoading, setEmotionLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Formater le temps écoulé
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

  // Charger le profil utilisateur et un post aléatoire
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Charger le profil utilisateur
        const profileResponse = await getMyProfile();
        console.log("Profile response:", profileResponse);
        
        if (!profileResponse.success || !profileResponse.data) {
          console.error("Erreur profil:", profileResponse);
          throw new Error(profileResponse.message || "Erreur lors du chargement du profil");
        }
        
        setUserProfile(profileResponse.data);
        
        // Charger des posts
        try {
          // Charger des posts - utiliser page 1 au lieu de 10
          const postsResponse = await getPosts(1);
          console.log("Posts response:", postsResponse);
          
          if (postsResponse.success && postsResponse.data && postsResponse.data.posts && postsResponse.data.posts.length > 0) {
            // Sélectionner un post aléatoire
            const availablePosts = postsResponse.data.posts;
            const randomIndex = Math.floor(Math.random() * availablePosts.length);
            const randomPost = availablePosts[randomIndex];
            
            // Le reste du code reste identique
            setPost({
              id: randomPost.post._id,
              user: {
                name: randomPost.post.author.username,
                username: randomPost.post.author.hashtag,
                avatar: randomPost.post.author.pdp || "https://randomuser.me/api/portraits/lego/1.jpg",
                premium: randomPost.post.author.premium
              },
              content: randomPost.post.texte,
              image: randomPost.post.media?.url || undefined,
              timestamp: formatTimeAgo(new Date(randomPost.post.createdAt)),
              stats: {
                comments: randomPost.stats.replies || 0,
                retweets: randomPost.stats.retweets || 0,
                likes: randomPost.stats.likes || 0
              }
            });
          } else {
            console.warn("Aucun post disponible, utilisation du post de secours");
            setPost(FALLBACK_POST);
          }
        } catch (postError) {
          console.error("Erreur lors du chargement des posts:", postError);
          console.warn("Utilisation du post de secours suite à l'erreur");
          setPost(FALLBACK_POST);
        }
        
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err instanceof Error ? err.message : "Une erreur inconnue s'est produite");
        
        // En cas d'échec complet, au moins charger le post de secours
        setPost(FALLBACK_POST);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [formatTimeAgo]);

  // Sauvegarder les captures d'écran pour affichage ultérieur
  const handleCaptureSnapshots = (snapshots: string[]) => {
    console.log(`Reçu ${snapshots.length} captures d'écran`);
    setCapturedSnapshots(snapshots);
  };

  // Gérer la fin de l'enregistrement des snapshots
  const handleWebcamSuccess = useCallback(async () => {
    setShowWebcam(false);
    setEmotionLoading(true);
    
    // Ajouter un message intermédiaire
    console.log("Attente de 2 secondes pour laisser à l'API le temps de traiter les images...");
    
    // Utiliser setTimeout pour ajouter un délai de 2 secondes
    setTimeout(async () => {
      try {
        // Construction de l'URL avec les paramètres user_id et post_id
        const userId = userProfile?.id || "unknown-user";
        const postId = post?.id || "unknown-post";
        const emotionUrl = `${EMOTION_API_URL}?user_id=${userId}&post_id=${postId}`;
        
        console.log("Récupération des émotions depuis:", emotionUrl);
        const response = await axios.get(emotionUrl);
        console.log("Réponse de l'API d'émotions:", response.data);
        
        if (response.status === 200 && response.data && response.data.length > 0) {
          // Prendre le plus récent
          const latestEmotion = response.data[0];
          console.log("Émotion détectée:", latestEmotion);
          setEmotion(latestEmotion);
        } else {
          throw new Error("Aucune donnée d'émotion trouvée");
        }
        
        setTestCompleted(true);
      } catch (err) {
        console.error("Erreur lors de la récupération des émotions:", err);
        setError("Impossible de récupérer les données d'émotion");
        
        // Fallback pour démo - émotion fictive
        setEmotion({
          user_id: userProfile?.id || "user-test",
          post_id: post?.id || "post-test",
          emotion: "neutral",
          created_at: new Date().toISOString()
        });
        setTestCompleted(true);
      } finally {
        setEmotionLoading(false);
      }
    }, 2000); // Délai de 2000ms (2 secondes)
    
  }, [post?.id, userProfile?.id]);

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Test d'Analyse d'Émotions</h1>
          <p className="text-gray-600 mt-2">
            Cette page vous permet de tester l'analyse d'émotions en regardant une publication.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center">
            <FiLoader className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-lg text-gray-700">Chargement des données...</span>
          </div>
        ) : error && !post ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <FiInfo className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Une erreur s'est produite</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Publication à regarder */}
            {post && !testCompleted && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Publication à regarder</h2>
                <PostCard {...post} />

                {!showWebcam && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setShowWebcam(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <FiCamera className="w-5 h-5" />
                      Commencer le test d'émotion
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Zone de webcam */}
            {showWebcam && (
              <div className="mb-6">
                <WebcamEmotionCapture 
                  onClose={() => setShowWebcam(false)}
                  apiUrl={SNAPSHOTS_API_URL}
                  onSuccess={handleWebcamSuccess}
                  onCaptureSnapshots={handleCaptureSnapshots}
                  custom_user_id={userProfile?.id}
                  custom_post_id={post?.id}
                  duration={RECORDING_DURATION} // Durée personnalisée de 5 secondes
                />
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mt-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FiInfo className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <p>Regardez la publication pendant que nous analysons vos émotions. L'enregistrement durera 5 secondes.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats du test */}
            {emotionLoading && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Analyse des émotions en cours</h2>
                <p className="text-gray-600 mt-2">Veuillez patienter pendant que nous analysons vos émotions...</p>
              </div>
            )}

            {testCompleted && emotion && post && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 50 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 ml-3">Analyse complétée !</h2>
                </div>

                {/* Publication */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Publication analysée
                  </h3>
                  <PostCard {...post} />
                </div>

                {/* Résultat de l'émotion */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Résultat de l'analyse</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl">
                        {getEmotionEmoji(emotion.emotion)}
                      </div>
                      <div className="ml-5">
                        <h4 className="text-lg font-medium text-gray-800 mb-1">
                          Votre émotion dominante:
                        </h4>
                        <div className="text-2xl font-bold text-indigo-600 capitalize">
                          {emotion.emotion}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Enregistré le {new Date(emotion.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-2">Détails de la capture:</h5>
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                        <div>ID utilisateur:</div>
                        <div className="font-mono">{emotion.user_id}</div>
                        <div>ID publication:</div>
                        <div className="font-mono">{emotion.post_id}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aperçu des images capturées */}
                {capturedSnapshots.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Images capturées</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {capturedSnapshots.slice(0, 5).map((snapshot, index) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={snapshot} 
                            alt={`Snapshot ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    Faire un nouveau test
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}