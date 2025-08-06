
import React from 'react';

export const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,0C5.37,0,0,5.37,0,12c0,5.09,3.06,9.44,7.34,11.23c-0.03-0.45-0.06-0.93-0.06-1.39c0-2.31,1.52-4.2,3.46-4.2 c0.87,0,1.57,0.22,2.15,0.61c0.69-0.48,1.58-0.78,2.57-0.78c2.4,0,4.35,1.96,4.35,4.38c0,0.49-0.05,0.97-0.14,1.43 C20.35,21.09,24,16.94,24,12C24,5.37,18.63,0,12,0z M7.75,13.25c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5 S8.58,13.25,7.75,13.25z M12,17.5c-2.21,0-4-1.79-4-4h8C16,15.71,14.21,17.5,12,17.5z M16.25,13.25c-0.83,0-1.5-0.67-1.5-1.5 s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S17.08,13.25,16.25,13.25z"/>
  </svg>
);

export const HackerNewsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0,0V24H24V0ZM18.5,17.5H5.5V6.5h13Z M16.62,11.62,14,15.25H12.75L15.37,11,12.75,6.75H14l2.62,4.25Z"/>
  </svg>
);

export const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.75A.75.75 0 0114.25 6h1.5a.75.75 0 01.75.75v1.5m-4.5 0h4.5m-4.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5" />
  </svg>
);


// Reverted to Unicode Icons with better font support
export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span className={className} role="img" aria-label="Refresh">🗘</span>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span className={className} role="img" aria-label="Settings">⛭</span>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <span className={className} role="img" aria-label="Show all articles">🗪</span>
);

export const ChatSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative inline-block ${className}`}>
    <span role="img" aria-label="Hide articles with no comments">🗪</span>
    <span className="absolute top-1/2 left-1/2 w-full h-[2px] bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></span>
  </div>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className} role="img" aria-label="Download">⇓</span>
);
