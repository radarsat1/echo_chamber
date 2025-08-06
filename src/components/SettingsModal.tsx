
import React, { useState } from 'react';
import { useFeedManager } from '../hooks/useFeedManager';
import { Feed } from '../types';
import { DownloadIcon } from './icons';
import { CORS_PROXY_URL } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { feeds, addFeed, removeFeed, importFeeds } = useFeedManager();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(feeds, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'echo-chamber-feeds.json';
    link.click();
  };

  const processImportedFeeds = (parsedFeeds: any) => {
    if (Array.isArray(parsedFeeds) && parsedFeeds.every(f => f.name && f.url)) {
      importFeeds(parsedFeeds);
      setError('');
      return true;
    }
    return false;
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/json') {
      setError('Please drop a valid JSON file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!processImportedFeeds(JSON.parse(content))) {
            throw new Error('Invalid feed format in JSON file.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleImportFromUrl = async () => {
    if (!importUrl) return;
    try {
        new URL(importUrl);
        const res = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(importUrl)}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        if (!processImportedFeeds(await res.json())) {
            throw new Error('Invalid feed format from URL.');
        }
        setImportUrl('');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import from URL.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
      <div 
        className="bg-secondary rounded-lg shadow-xl w-full max-w-md m-4 overflow-hidden" 
        onClick={e => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`absolute inset-0 bg-highlight bg-opacity-50 z-10 flex items-center justify-center pointer-events-none transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-2xl font-bold text-white">Drop JSON file to import</p>
        </div>

        <div className="p-6 border-b border-accent">
          <h2 className="text-2xl font-bold text-light">Manage Feeds</h2>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && <p className="bg-red-900 text-red-200 text-sm mb-4 p-3 rounded-md">{error}</p>}
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg text-light">Current Feeds</h3>
            <button onClick={handleExport} className="p-2 rounded-full text-text-secondary hover:bg-accent hover:text-light transition-colors" aria-label="Export Feeds">
                <DownloadIcon className="text-xl"/>
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-b border-accent pb-4">
            {feeds.map(feed => (
              <div key={feed.url} className="flex justify-between items-center bg-primary p-3 rounded-md">
                <div>
                  <p className="font-semibold text-text-main">{feed.name}</p>
                  <p className="text-xs text-text-secondary truncate">{feed.url}</p>
                </div>
                <button onClick={() => removeFeed(feed.url)} className="bg-red-500 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            ))}
             {feeds.length === 0 && <p className="text-text-secondary text-center py-4">No feeds configured.</p>}
          </div>

          <form onSubmit={handleAddFeed} className="mt-6">
            <h3 className="font-semibold text-lg mb-3 text-light">Add New Feed</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Feed Name (e.g., 'My Favorite Blog')" value={newFeedName} onChange={e => setNewFeedName(e.target.value)} className="w-full bg-accent p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight text-light" />
              <input type="url" placeholder="https://example.com/rss.xml" value={newFeedUrl} onChange={e => setNewFeedUrl(e.target.value)} className="w-full bg-accent p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight text-light" />
            </div>
            <button type="submit" className="bg-highlight text-white rounded px-4 py-2 font-semibold hover:bg-blue-600 transition-colors w-full mt-4">
                 Add Feed
            </button>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3 text-light">Import from URL</h3>
             <div className="flex space-x-2">
                <input type="url" placeholder="https://example.com/feeds.json" value={importUrl} onChange={e => setImportUrl(e.target.value)} className="flex-grow w-full bg-accent p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-highlight text-light" />
                <button onClick={handleImportFromUrl} className="bg-accent text-light rounded px-4 py-2 font-semibold hover:bg-gray-600 transition-colors">
                    Load
                </button>
             </div>
          </div>
        </div>
        <div className="p-4 bg-primary flex justify-end">
            <button onClick={onClose} className="bg-accent text-light rounded px-4 py-2 font-semibold hover:bg-gray-600 transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
