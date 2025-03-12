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
import { toggleLike } from '../../callApi/CallApi_ToggleLike';
import { toggleRetweet } from '../../callApi/CallApi_ToggleRT';
import { toggleSignet } from '../../callApi/CallApi_ToggleSignet';

interface PostCardProps {
  id: string;
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
  id,
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

  const { formattedContent, detectedImageUrls } = useMemo(() => formatText(content), [content]);
  const allImages = useMemo(() => {
    const images = [...detectedImageUrls];
    if (image) images.unshift(image);
    return images;
  }, [image, detectedImageUrls]);

  const handleLike = async () => {
    if (isPreview) return;
    const result = await toggleLike(id);
    if (result.success) {
      setLiked(result.isLiked);
      setLikes(result.isLiked ? likes + 1 : likes - 1);
    } else {
      console.error(result.message);
    }
  };

  const handleRetweet = async () => {
    if (isPreview) return;
    const result = await toggleRetweet(id);
    if (result.success) {
      setRetweeted(result.isRetweeted);
      setRetweets(result.isRetweeted ? retweets + 1 : retweets - 1);
    } else {
      console.error(result.message);
    }
  };

  const handleBookmark = async () => {
    if (isPreview) return;
    const result = await toggleSignet(id);
    if (result.success) {
      setBookmarked(result.isBookmarked);
    } else {
      console.error(result.message);
    }
  };

  const previewClass = isPreview ? "pointer-events-none opacity-75" : "";

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 mb-4 ${isPreview ? '' : 'hover:bg-gray-50'} transition-colors`}>
      {/* En-tête du post */}
      <div className="flex justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h4 className="font-bold text-gray-900">{user.name}</h4>
              {user.verified && (
                <span className="ml-1 text-blue-500">
                  {/* ... icône de vérification ... */}
                </span>
              )}
              <span className="text-gray-500 ml-2 font-normal">@{user.username}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-500 text-sm">{timestamp}</span>
            </div>
          </div>
        </div>
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

      {/* Gestion des images */}
      {allImages.length > 0 && (
        <div className={`mt-3 grid gap-2 ${allImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {allImages.map((img, index) => (
            <div key={index} className={`rounded-xl overflow-hidden ${allImages.length > 2 && index >= 2 ? 'lg:col-span-1' : ''}`}>
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

      {/* Actions */}
      <div className={`mt-3 flex justify-between items-center ${previewClass}`}>
        <ActionButton
          icon={<FiMessageCircle />}
          count={stats.comments}
          hoverColor={isPreview ? "" : "hover:text-blue-500"}
          hoverBgColor={isPreview ? "" : "group-hover:bg-blue-50"}
          ariaLabel="Commenter"
          disable={isPreview}
        />
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