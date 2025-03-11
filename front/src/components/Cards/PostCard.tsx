import { useState } from 'react';
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
}

export default function PostCard({
  user,
  content,
  image,
  timestamp,
  stats,
  isLiked = false,
  isRetweeted = false,
  isBookmarked = false
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(stats.likes);
  const [retweeted, setRetweeted] = useState(isRetweeted);
  const [retweets, setRetweets] = useState(stats.retweets);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };
  
  const handleRetweet = () => {
    setRetweeted(!retweeted);
    setRetweets(retweeted ? retweets - 1 : retweets + 1);
  };
  
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 hover:bg-gray-50 transition-colors">
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
        
        {/* Menu trois points */}
        <button className="text-gray-400 hover:text-gray-600 rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <FiMoreHorizontal />
        </button>
      </div>
      
      {/* Contenu du post */}
      <div className="mt-2">
        <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
      </div>
      
      {/* Image (si présente) */}
      {image && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img 
            src={image} 
            alt="Post image" 
            className="w-full h-auto object-cover rounded-xl border border-gray-100" 
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-3 flex justify-between items-center">
        {/* Commentaires */}
        <ActionButton 
          icon={<FiMessageCircle />} 
          count={stats.comments}
          hoverColor="hover:text-blue-500"
          hoverBgColor="group-hover:bg-blue-50"
          ariaLabel="Commenter"
        />
        
        {/* Retweets */}
        <ActionButton 
          icon={<FiRepeat />} 
          count={retweets}
          onClick={handleRetweet}
          isActive={retweeted}
          activeColor="text-green-500"
          hoverColor="hover:text-green-500"
          activeBgColor="bg-green-50"
          hoverBgColor="group-hover:bg-green-50"
          ariaLabel="Retweeter"
        />
        
        {/* Likes */}
        <ActionButton 
          icon={<FiHeart />} 
          count={likes}
          onClick={handleLike}
          isActive={liked}
          activeColor="text-red-500"
          hoverColor="hover:text-red-500"
          activeBgColor="bg-red-50"
          hoverBgColor="group-hover:bg-red-50"
          filled={true}
          ariaLabel="J'aime"
        />
        
        {/* Bookmark */}
        <ActionButton 
          icon={<FiBookmark />}
          onClick={handleBookmark}
          isActive={bookmarked}
          activeColor="text-blue-500"
          hoverColor="hover:text-blue-500"
          activeBgColor="bg-blue-50"
          hoverBgColor="group-hover:bg-blue-50"
          filled={true}
          ariaLabel="Sauvegarder"
        />
        
        {/* Partager */}
        <ActionButton 
          icon={<FiShare />}
          hoverColor="hover:text-blue-500"
          hoverBgColor="group-hover:bg-blue-50"
          ariaLabel="Partager"
        />
      </div>
    </div>
  );
}