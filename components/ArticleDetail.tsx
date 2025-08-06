
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeedManager } from '../hooks/useFeedManager';
import { Article, Comment } from '../types';
import Spinner from './Spinner';
import CommentSection from './CommentSection';
import { BackIcon, ExternalLinkIcon } from './icons';
import { summarizeCommentsWithGemini } from '../services/geminiService';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, fetchSocialData } = useFeedManager();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'hn' | 'reddit'>('hn');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    const foundArticle = articles.find(a => a.id === id);
    if (foundArticle) {
      setArticle(foundArticle);
      
      // Fetch social data if it hasn't been fetched
      fetchSocialData(foundArticle.id);

      // Default to the tab with more comments if data is available
      if (foundArticle.social.reddit.commentCount > foundArticle.social.hn.commentCount) {
        setActiveTab('reddit');
      } else {
        setActiveTab('hn');
      }
    }
  }, [id, articles, fetchSocialData]);

  const allComments = useMemo(() => {
    if (!article) return [];
    return [...article.social.hn.comments, ...article.social.reddit.comments];
  }, [article]);

  const handleSummarize = async () => {
    if (!article || allComments.length === 0) return;
    setIsSummarizing(true);
    setSummary('');
    setSummaryError('');
    try {
      const result = await summarizeCommentsWithGemini(allComments, article.title);
      setSummary(result);
    } catch (error) {
      console.error("Gemini summary failed:", error);
      setSummaryError('Failed to generate summary. The AI model might be unavailable.');
    } finally {
      setIsSummarizing(false);
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
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold text-light hover:text-highlight transition-colors flex-1 min-w-0">
          <span className="truncate">{article.title}</span>
        </a>
         <a href={article.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-accent ml-2 flex-shrink-0">
          <ExternalLinkIcon className="w-6 h-6"/>
        </a>
      </div>

      <div className="prose prose-invert max-w-none text-text-secondary bg-primary rounded-lg p-4" dangerouslySetInnerHTML={descriptionHtml} />
      
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-2 text-light">Discussion Summary</h3>
        {allComments.length > 0 ? (
          <>
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isSummarizing ? 'Thinking...' : 'Summarize with AI'}
            </button>
            {isSummarizing && <div className="mt-4"><Spinner /></div>}
            {summaryError && <p className="mt-4 text-red-400">{summaryError}</p>}
            {summary && (
              <div className="mt-4 p-4 bg-primary rounded-lg prose prose-invert max-w-none whitespace-pre-wrap">
                <p>{summary}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-text-secondary">No comments found to summarize.</p>
        )}
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2 text-light">Comments</h3>
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