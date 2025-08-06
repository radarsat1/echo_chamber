
import React from 'react';
import { Comment } from '../types';
import { HackerNewsIcon, RedditIcon, ExternalLinkIcon } from './icons';
import Spinner from './Spinner';

interface CommentSectionProps {
  comments: Comment[];
  source: 'hn' | 'reddit';
  error?: string;
  sourceUrl: string | null;
  isFetching?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, source, error, sourceUrl, isFetching }) => {
  const sourceName = source === 'hn' ? 'Hacker News' : 'Reddit';

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

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="bg-primary p-3 rounded-lg">
          <div className="flex items-center text-sm text-text-secondary mb-2">
            {source === 'hn' ? <HackerNewsIcon className="w-4 h-4 mr-2 text-[#FF6600]" /> : <RedditIcon className="w-4 h-4 mr-2 text-[#FF4500]" />}
            <a href={comment.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{comment.author}</a>
          </div>
          <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comment.body }} />
        </div>
      ))}
    </div>
  );
};

export default CommentSection;