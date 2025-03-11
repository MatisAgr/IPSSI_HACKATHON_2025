import { useState, useMemo } from 'react';
import {
  FiMessageCircle,
  FiRepeat,
  FiHeart,
  FiBookmark,
  FiMoreHorizontal,
  FiShare
} from 'react-icons/fi';
import ActionButton from '../Buttons/ActionButton';

interface PostCardProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  stats: {
    comments: number;
    retweets: number;
    likes: number;
  };
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  isPreview?: boolean;
}

// Fonction pour formater le texte avec les liens, hashtags et mentions
const formatText = (text: string) => {
  // Expressions régulières pour détecter les différents éléments
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /(?:^|\s)(#[a-zA-Z0-9_]+\b)/g;
  const mentionRegex = /(?:^|\s)(@[a-zA-Z0-9_]+\b)/g;

  // Vérifier si une URL est une image
  const isImageUrl = (url: string) => {
    // Extensions d'images courantes
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.endsWith(ext));
  };

  // Tableau pour stocker les URLs d'images détectées
  const detectedImageUrls: string[] = [];

  // Étape 1: Détecter les liens d'images et les stocker
  const withoutImageUrls = text.replace(urlRegex, (match) => {
    if (isImageUrl(match)) {
      detectedImageUrls.push(match);
      // Remplacer par un espace pour ne pas montrer le lien dans le texte
      return '';
    }
    return match;
  });

  // Étape 2: Formater le texte avec les liens (non-images), hashtags et mentions
  const parts = withoutImageUrls.split(/(\s+)/);

  const formattedParts = parts.map((part, index) => {
    // Vérifier si c'est un lien
    if (part.match(urlRegex)) {
      return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{part}</a>;
    }

    // Vérifier si c'est un hashtag
    else if (part.match(hashtagRegex)) {
      return <a key={index} href={`/hashtag/${part.substring(1)}`} className="text-blue-500 hover:underline">{part}</a>;
    }

    // Vérifier si c'est une mention
    else if (part.match(mentionRegex)) {
      return <a key={index} href={`/user/${part.substring(1)}`} className="text-blue-500 hover:underline">{part}</a>;
    }

    // Sinon, garder le texte tel quel
    return part;
  });

  return { formattedContent: formattedParts, detectedImageUrls };
};

export default function PostCard({
  user,
  content,
  image,
  timestamp,
  stats,
  isLiked = false,
  isRetweeted = false,
  isBookmarked = false,
  isPreview = false
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(stats.likes);
  const [retweeted, setRetweeted] = useState(isRetweeted);
  const [retweets, setRetweets] = useState(stats.retweets);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Utiliser useMemo pour éviter de reformater le contenu à chaque rendu
  const { formattedContent, detectedImageUrls } = useMemo(() => formatText(content), [content]);

  // Combiner l'image explicitement fournie avec celles détectées dans le contenu
  const allImages = useMemo(() => {
    const images = [...detectedImageUrls];
    if (image) images.unshift(image);
    return images;
  }, [image, detectedImageUrls]);

  const handleLike = () => {
    if (isPreview) return; // Ne rien faire si en mode prévisualisation
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleRetweet = () => {
    if (isPreview) return; // Ne rien faire si en mode prévisualisation
    setRetweeted(!retweeted);
    setRetweets(retweeted ? retweets - 1 : retweets + 1);
  };

  const handleBookmark = () => {
    if (isPreview) return; // Ne rien faire si en mode prévisualisation
    setBookmarked(!bookmarked);
  };

  // Classes CSS pour le mode prévisualisation
  const previewClass = isPreview ? "pointer-events-none opacity-75" : "";

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 mb-4 ${isPreview ? '' : 'hover:bg-gray-50'} transition-colors`}>
      {/* En-tête du post */}
      <div className="flex justify-between">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
          </div>

          {/* Info utilisateur */}
          <div>
            <div className="flex items-center">
              <h4 className="font-bold text-gray-900">{user.name}</h4>
              {user.verified && (
                <span className="ml-1 text-blue-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5c-1.51 0-2.816.917-3.437 2.25-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                </span>
              )}
              <span className="text-gray-500 ml-2 font-normal">@{user.username}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-500 text-sm">{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Menu trois points - caché en mode prévisualisation */}
        {!isPreview && (
          <button className="text-gray-400 hover:text-gray-600 rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <FiMoreHorizontal />
          </button>
        )}
      </div>

      {/* Contenu du post */}
      <div className="mt-2">
        <p className="text-gray-900 whitespace-pre-wrap">{formattedContent}</p>
      </div>

      {/* Images (du prop ou détectées dans le contenu) */}
      {allImages.length > 0 && (
        <div className={`mt-3 grid gap-2 ${allImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {allImages.map((img, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden ${allImages.length > 2 && index >= 2 ? 'lg:col-span-1' : ''}`}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-auto max-h-96 object-cover rounded-xl border border-gray-100"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions - avec une classe pour désactiver les interactions en mode prévisualisation */}
      <div className={`mt-3 flex justify-between items-center ${previewClass}`}>
        {/* Commentaires */}
        <ActionButton
          icon={<FiMessageCircle />}
          count={stats.comments}
          hoverColor={isPreview ? "" : "hover:text-blue-500"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-blue-50"}
          ariaLabel="Commenter"
          disable={isPreview}
        />

        {/* Retweets */}
        <ActionButton
          icon={<FiRepeat />}
          count={retweets}
          onClick={isPreview ? undefined : handleRetweet}
          isActive={retweeted}
          activeColor={isPreview ? "text-gray-500" : "text-green-500"}
          hoverColor={isPreview ? "" : "hover:text-green-500"}
          activeBgColor={isPreview ? "" : "bg-green-50"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-green-50"}
          ariaLabel="Retweeter"
          disable={isPreview}
        />

        {/* Likes */}
        <ActionButton
          icon={<FiHeart />}
          count={likes}
          onClick={isPreview ? undefined : handleLike}
          isActive={liked}
          activeColor={isPreview ? "text-gray-500" : "text-red-500"}
          hoverColor={isPreview ? "" : "hover:text-red-500"}
          activeBgColor={isPreview ? "" : "bg-red-50"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-red-50"}
          filled={true}
          ariaLabel="J'aime"
          disable={isPreview}
        />

        {/* Bookmark */}
        <ActionButton
          icon={<FiBookmark />}
          onClick={isPreview ? undefined : handleBookmark}
          isActive={bookmarked}
          activeColor={isPreview ? "text-gray-500" : "text-blue-500"}
          hoverColor={isPreview ? "" : "hover:text-blue-500"}
          activeBgColor={isPreview ? "" : "bg-blue-50"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-blue-50"}
          filled={true}
          ariaLabel="Sauvegarder"
          disable={isPreview}
        />

        {/* Partager */}
        <ActionButton
          icon={<FiShare />}
          hoverColor={isPreview ? "" : "hover:text-blue-500"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-blue-50"}
          ariaLabel="Partager"
          disable={isPreview}
        />
      </div>
    </div>
  );
}
>>>>>>> 01f279ba4261e7353e0020a1ca4e2e19da09f9e3
