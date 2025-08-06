
import React, { useState } from 'react';
import { useFeedManager } from '../hooks/useFeedManager';
import { RefreshIcon, SettingsIcon } from './icons';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
  const { refreshFeeds, isLoading } = useFeedManager();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-secondary shadow-md sticky top-0 z-20">
        <div className="container mx-auto p-4 flex justify-between items-center max-w-4xl">
          <h1 className="text-xl md:text-2xl font-bold text-light tracking-tight">
            Echo Chamber
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => refreshFeeds(true)}
              disabled={isLoading}
              className="p-2 rounded-full text-text-secondary hover:bg-accent hover:text-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh Feeds"
            >
              <RefreshIcon className={`w-6 h-6 ${isLoading ? 'animate-spin-slow' : ''}`} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-text-secondary hover:bg-accent hover:text-light transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Header;
