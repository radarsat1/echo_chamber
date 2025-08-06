
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

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" />
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

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527c.43-.306.98-.172 1.213.26l.515.892c.232.403.126.906-.247 1.147l-.737.527c-.35.25-.56.678-.56 1.107v1.185c0 .428.21.857.56 1.107l.737.527c.373.24.48.744.247 1.147l-.515.892c-.233.432-.784.566-1.213.26l-.737-.527c-.35-.25-.807-.272-1.205-.108-.396.165-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205-.108l-.737.527c-.43.306-.98-.172-1.213-.26l-.515-.892c-.232-.403-.126-.906.247-1.147l.737-.527c.35-.25.56-.678.56-1.107V12.5c0-.428-.21-.857-.56-1.107l-.737-.527c-.373-.24-.48-.744-.247-1.147l.515-.892c.233-.432.784-.566-1.213.26l.737-.527c.35-.25.807-.272 1.205-.108.396.165.71.506.78.93l.149.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
