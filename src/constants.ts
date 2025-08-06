import { Feed } from './types';

export const DEFAULT_FEEDS: Feed[] = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' }
];

// Using a public CORS proxy. In a real-world app, this should be a dedicated service.
export const CORS_PROXY_URL = 'https://corsproxy.io/?';
