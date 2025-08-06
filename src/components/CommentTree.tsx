import React from 'react';
import { Comment } from '../types';
import { HackerNewsIcon, RedditIcon } from './icons';

interface CommentTreeProps {
  comments: Comment[];
  source: 'hn' | 'reddit';
}

const CommentTree: React.FC<CommentTreeProps> = ({ comments, source }) => {
  const borderColors = [
    'border-blue-400', 'border-green-400', 'border-yellow-400', 'border-purple-400', 'border-pink-400', 'border-red-400'
  ];

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} style={{ marginLeft: `${comment.depth * 1}rem` }} className={`pl-2 border-l-2 ${comment.depth > 0 ? borderColors[comment.depth % borderColors.length] : 'border-transparent'}`}>
          <div className="bg-primary p-3 rounded-lg">
            <div className="flex items-center text-sm text-text-secondary mb-2">
              {source === 'hn' ? <HackerNewsIcon className="w-4 h-4 mr-2 text-[#FF6600]" /> : <RedditIcon className="w-4 h-4 mr-2 text-[#FF4500]" />}
              <a href={comment.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">{comment.author}</a>
            </div>
            <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comment.body }} />
          </div>

          {comment.children && comment.children.length > 0 && (
            <div className="mt-2">
              <CommentTree comments={comment.children} source={source} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentTree;