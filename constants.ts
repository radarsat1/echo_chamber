import { Feed } from './types';

export const DEFAULT_FEEDS: Feed[] = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
  { name: "Simon Willison's Blog", url: 'https://simonwillison.net/atom/everything/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
];

// Using a public CORS proxy. In a real-world app, this should be a dedicated service.
export const CORS_PROXY_URL = 'https://corsproxy.io/?';