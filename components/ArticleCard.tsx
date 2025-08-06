import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { RedditIcon, HackerNewsIcon } from './icons';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link
      to={`/article/${article.id}`}
      className="block bg-secondary rounded-lg shadow-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-highlight font-semibold truncate">{article.feedName}</p>
          <h2 className="text-lg font-bold text-light mt-1">{article.title}</h2>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <HackerNewsIcon className="w-5 h-5 text-[#FF6600]" />
            <span className="font-mono w-6 text-right">{article.social.hn.commentCount}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <RedditIcon className="w-5 h-5 text-[#FF4500]" />
            <span className="font-mono w-6 text-right">{article.social.reddit.commentCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;