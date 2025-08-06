
import React, { useState, useMemo } from 'react';
import { useFeedManager } from '../hooks/useFeedManager';
import ArticleCard from './ArticleCard';
import Spinner from './Spinner';
import { Article } from '../types';

const ARTICLES_PER_PAGE = 10;

const ArticleList: React.FC = () => {
  const { articles, isLoading, lastUpdated, initialLoad, showEmpty } = useFeedManager();
  const [currentPage, setCurrentPage] = useState(1);

  const interleavedArticles = useMemo(() => {
    const filtered = showEmpty
      ? articles
      : articles.filter(article => article.social.hn.commentCount > 0 || article.social.reddit.commentCount > 0);

    const articlesByFeed: Record<string, Article[]> = filtered.reduce((acc, article) => {
      acc[article.feedName] = acc[article.feedName] || [];
      acc[article.feedName].push(article);
      return acc;
    }, {} as Record<string, Article[]>);

    for (const feedName in articlesByFeed) {
      articlesByFeed[feedName].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }

    const result: Article[] = [];
    let hasMoreArticles = true;
    let i = 0;
    while (hasMoreArticles) {
      hasMoreArticles = false;
      const round: Article[] = [];
      for (const feedName in articlesByFeed) {
        if (articlesByFeed[feedName][i]) {
          round.push(articlesByFeed[feedName][i]);
          hasMoreArticles = true;
        }
      }
      round.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      result.push(...round);
      i++;
    }

    return result;
  }, [articles, showEmpty]);

  const totalPages = Math.ceil(interleavedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = interleavedArticles.slice(startIndex, endIndex);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Reset to page 1 if filters change and current page becomes invalid
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }

  if (initialLoad) {
    return <div className="mt-20 flex justify-center"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="text-right text-sm text-text-secondary pr-2">
          {isLoading && <span className="animate-pulse">Checking for new articles...</span>}
          {!isLoading && lastUpdated && <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>}
      </div>

      {currentArticles.length === 0 && !isLoading ? (
        <div className="text-center py-16 px-4 bg-secondary rounded-lg">
          <h2 className="text-2xl font-bold text-light">No articles found.</h2>
          <p className="text-text-secondary mt-2">{showEmpty ? "Try adding an RSS feed in the settings or refreshing." : "No articles with comments found. Toggle the filter to see all articles."}</p>
        </div>
      ) : (
        currentArticles.map(article => <ArticleCard key={article.id} article={article} />)
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-2">
          <button onClick={goToPrevPage} disabled={currentPage === 1} className="bg-accent text-light rounded px-4 py-2 font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="bg-accent text-light rounded px-4 py-2 font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
