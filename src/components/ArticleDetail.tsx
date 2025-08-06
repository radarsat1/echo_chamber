
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeedManager } from '../hooks/useFeedManager';
import { Article } from '../types';
import Spinner from './Spinner';
import CommentSection from './CommentSection';
import { BackIcon, ExternalLinkIcon, RefreshIcon } from './icons';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, fetchSocialData } = useFeedManager();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'hn' | 'reddit'>('hn');

  useEffect(() => {
    const foundArticle = articles.find(a => a.id === id);
    if (foundArticle) {
      setArticle(foundArticle);
      // Fetch social data if it hasn't been fetched
      fetchSocialData(foundArticle.id);
    }
  }, [id, articles, fetchSocialData]);

  const handleRefreshComments = () => {
    if (article) {
      fetchSocialData(article.id, true);
    }
  };

  if (!article) {
    return <div className="mt-20 flex justify-center"><Spinner /></div>;
  }
  
  const descriptionHtml = { __html: article.description };

  return (
    <div className="bg-secondary rounded-lg shadow-xl p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <Link to="/" className="p-2 rounded-full hover:bg-accent mr-2" aria-label="Back to list">
          <BackIcon className="w-6 h-6" />
        </Link>
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold text-light hover:text-highlight transition-colors flex-1 min-w-0 break-words">
          {article.title}
        </a>
         <a href={article.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent ml-2 flex-shrink-0">
          <ExternalLinkIcon className="w-6 h-6"/>
        </a>
      </div>

      <div className="prose prose-invert max-w-none text-text-secondary bg-primary rounded-lg p-4" dangerouslySetInnerHTML={descriptionHtml} />
      
      <div className="flex justify-between items-center mt-6 mb-2">
        <h3 className="text-lg font-semibold text-light">Comments</h3>
        <button
          onClick={handleRefreshComments}
          disabled={article.social.isFetching}
          className="p-2 rounded-full text-text-secondary hover:bg-accent hover:text-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh Comments"
        >
          <RefreshIcon className={`text-xl ${article.social.isFetching ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      <div className="border-b border-accent flex">
        <button
          onClick={() => setActiveTab('hn')}
          className={`py-2 px-4 font-semibold ${activeTab === 'hn' ? 'text-light border-b-2 border-highlight' : 'text-text-secondary'}`}
        >
          Hacker News ({article.social.hn.commentCount})
        </button>
        <button
          onClick={() => setActiveTab('reddit')}
          className={`py-2 px-4 font-semibold ${activeTab === 'reddit' ? 'text-light border-b-2 border-highlight' : 'text-text-secondary'}`}
        >
          Reddit ({article.social.reddit.commentCount})
        </button>
      </div>
      <div className="mt-4">
        {activeTab === 'hn' && <CommentSection comments={article.social.hn.comments} source="hn" error={article.social.hn.error} sourceUrl={article.social.hn.url} isFetching={article.social.isFetching} />}
        {activeTab === 'reddit' && <CommentSection comments={article.social.reddit.comments} source="reddit" error={article.social.reddit.error} sourceUrl={article.social.reddit.url} isFetching={article.social.isFetching} />}
      </div>
    </div>
  );
};

export default ArticleDetail;
