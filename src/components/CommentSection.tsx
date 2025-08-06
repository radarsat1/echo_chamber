import React, { useState } from 'react';
import { Comment } from '../types';
import { ExternalLinkIcon } from './icons';
import Spinner from './Spinner';
import CommentTree from './CommentTree';

interface CommentSectionProps {
  comments: Comment[];
  source: 'hn' | 'reddit';
  error?: string;
  sourceUrl: string | null;
  isFetching?: boolean;
}

const PAGINATION_COUNT = 15;

const CommentSection: React.FC<CommentSectionProps> = ({ comments, source, error, sourceUrl, isFetching }) => {
  const [visibleCount, setVisibleCount] = useState(PAGINATION_COUNT);
  const sourceName = source === 'hn' ? 'Hacker News' : 'Reddit';

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGINATION_COUNT);
  };

  if (isFetching && comments.length === 0 && !error) {
    return (
        <div className="text-center py-8 px-4 bg-primary rounded-lg flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-text-secondary mt-4">Searching for comments on {sourceName}...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-8 px-4 bg-primary rounded-lg">
            <p className="text-red-400">Could not load comments from {sourceName}.</p>
            <p className="text-sm text-text-secondary mt-1">{error}</p>
        </div>
    );
  }

  if (comments.length === 0) {
    return (
        <div className="text-center py-8 px-4 bg-primary rounded-lg">
            <p className="text-text-secondary">No comments found on {sourceName}.</p>
            {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-highlight hover:underline">
                    Check on site <ExternalLinkIcon className="w-4 h-4 ml-1" />
                </a>
            )}
        </div>
    );
  }

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <CommentTree comments={visibleComments} source={source} />
      {visibleCount < comments.length && (
        <button
          onClick={handleLoadMore}
          className="w-full bg-accent hover:bg-gray-600 text-light font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Load More Comments ({comments.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
};

export default CommentSection;