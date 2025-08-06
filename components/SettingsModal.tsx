
import React, { useState } from 'react';
import { useFeedManager } from '../hooks/useFeedManager';
import { Feed } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { feeds, addFeed, removeFeed } = useFeedManager();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim() || !newFeedName.trim()) {
      setError('Both name and URL are required.');
      return;
    }
    try {
      new URL(newFeedUrl);
    } catch (_) {
      setError('Please enter a valid URL.');
      return;
    }
    
    addFeed({ name: newFeedName, url: newFeedUrl });
    setNewFeedName('');
    setNewFeedUrl('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-accent">
          <h2 className="text-2xl font-bold text-light">Manage Feeds</h2>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-light">Current Feeds</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {feeds.map(feed => (
              <div key={feed.url} className="flex justify-between items-center bg-primary p-3 rounded-md">
                <div>
                  <p className="font-semibold text-text-main">{feed.name}</p>
                  <p className="text-xs text-text-secondary truncate">{feed.url}</p>
                </div>
                <button
                  onClick={() => removeFeed(feed.url)}
                  className="bg-red-500 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddFeed} className="mt-6">
            <h3 className="font-semibold text-lg mb-3 text-light">Add New Feed</h3>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Feed Name (e.g., 'My Favorite Blog')"
                value={newFeedName}
                onChange={e => setNewFeedName(e.target.value)}
                className="w-full bg-accent p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight text-light"
              />
              <input
                type="url"
                placeholder="https://example.com/rss.xml"
                value={newFeedUrl}
                onChange={e => setNewFeedUrl(e.target.value)}
                className="w-full bg-accent p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight text-light"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
               <button type="button" onClick={onClose} className="bg-accent text-light rounded px-4 py-2 font-semibold hover:bg-gray-600 transition-colors">
                 Close
               </button>
               <button type="submit" className="bg-highlight text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 transition-colors">
                 Add Feed
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
