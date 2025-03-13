import React from 'react';

interface TrendingTopicProps {
  topic: string;
  posts: string | number;
  category: string;
}

const TrendingTopic: React.FC<TrendingTopicProps> = React.memo(({ topic, posts, category }) => (
  <div className="p-3 cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all rounded-xl">
    <div className="text-xs text-gray-500">{category}</div>
    <div className="font-semibold text-indigo-900">{topic}</div>
    <div className="text-xs text-gray-500">{posts} posts</div>
  </div>
));

TrendingTopic.displayName = 'TrendingTopic';

export default TrendingTopic;