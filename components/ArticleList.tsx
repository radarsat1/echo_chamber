
import React from 'react';
import { useFeedManager } from '../hooks/useFeedManager';
import ArticleCard from './ArticleCard';
import Spinner from './Spinner';

const ArticleList: React.FC = () => {
  const { articles, isLoading, lastUpdated, initialLoad } = useFeedManager();

  if (initialLoad) {
    return <div className="mt-20 flex justify-center"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="text-right text-sm text-text-secondary pr-2">
          {isLoading && <span className="animate-pulse">Checking for new articles...</span>}
          {!isLoading && lastUpdated && <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>}
      </div>

      {articles.length === 0 && !isLoading ? (
        <div className="text-center py-16 px-4 bg-secondary rounded-lg">
          <h2 className="text-2xl font-bold text-light">No articles found.</h2>
          <p className="text-text-secondary mt-2">Try adding an RSS feed in the settings or refreshing.</p>
        </div>
      ) : (
        articles.map(article => <ArticleCard key={article.id} article={article} />)
      )}
    </div>
  );
};

export default ArticleList;
