import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Article, Feed } from '../types';
import useLocalStorage from './useLocalStorage';
import { DEFAULT_FEEDS, CORS_PROXY_URL } from '../constants';
import { parseRssFeed } from '../services/rssParser';
import { fetchSocialDataForArticle } from '../services/socialApi';
import { produce } from 'immer';

interface FeedContextType {
  feeds: Feed[];
  addFeed: (feed: Feed) => void;
  removeFeed: (url: string) => void;
  articles: Article[];
  isLoading: boolean;
  initialLoad: boolean;
  lastUpdated: number | null;
  refreshFeeds: (force?: boolean) => void;
  fetchSocialData: (articleId: string) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useLocalStorage<Feed[]>('rss_feeds', DEFAULT_FEEDS);
  const [articles, setArticles] = useLocalStorage<Article[]>('rss_articles', []);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useLocalStorage<number | null>('rss_last_updated', null);

  const addFeed = (feed: Feed) => {
    if (!feeds.some(f => f.url === feed.url)) {
      setFeeds(prevFeeds => [...prevFeeds, feed]);
    }
  };

  const removeFeed = (url: string) => {
    setFeeds(prevFeeds => prevFeeds.filter(f => f.url !== url));
    setArticles(prevArticles => prevArticles.filter(a => a.feedUrl !== url));
  };
  
  const refreshFeeds = useCallback(async (force = false) => {
    if (isLoading) return;
    if (!force && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
      console.log('Using cached data. Last updated less than 15 minutes ago.');
      setInitialLoad(false);
      return;
    }

    setIsLoading(true);

    try {
      const feedPromises = feeds.map(feed =>
        fetch(`${CORS_PROXY_URL}${encodeURIComponent(feed.url)}`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch feed ${feed.name}: ${res.statusText}`);
            return res.text();
          })
          .then(xmlString => parseRssFeed(xmlString, feed))
          .catch(err => {
            console.error(`Error processing feed ${feed.name}:`, err);
            return []; // Return empty array on error to not break Promise.all
          })
      );
      
      const newArticlesArrays = await Promise.all(feedPromises);
      const newArticles = newArticlesArrays.flat();
      
      setArticles(prevArticles => {
        const articleMap = new Map(prevArticles.map(a => [a.id, a]));
        newArticles.forEach(a => {
          if (!articleMap.has(a.id)) {
            articleMap.set(a.id, a);
          }
        });
        return Array.from(articleMap.values()).sort((a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      });
      
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to refresh feeds:", error);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds, isLoading, lastUpdated]);

  const fetchSocialData = useCallback(async (articleId: string) => {
    const article = articles.find(a => a.id === articleId);

    if (!article || article.social.isFetching) return;
    
    const hasFetchedAll = (article.social.hn.id || article.social.hn.error) && (article.social.reddit.url || article.social.reddit.error);
    if (hasFetchedAll) return;

    setArticles(produce(draft => {
      const articleToUpdate = draft.find(a => a.id === articleId);
      if (articleToUpdate) {
        articleToUpdate.social.isFetching = true;
      }
    }));

    try {
      const socialData = await fetchSocialDataForArticle(article.link);
      setArticles(produce(draft => {
        const articleToUpdate = draft.find(a => a.id === articleId);
        if (articleToUpdate) {
          articleToUpdate.social = { ...socialData, isFetching: false };
        }
      }));
    } catch (e) {
      console.error(`Failed to fetch social data for ${article.id}`, e);
      setArticles(produce(draft => {
        const articleToUpdate = draft.find(a => a.id === articleId);
        if (articleToUpdate) {
          articleToUpdate.social.isFetching = false;
        }
      }));
    }
  }, [articles, setArticles]);

  useEffect(() => {
    refreshFeeds();
    const interval = setInterval(() => refreshFeeds(), CACHE_DURATION);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds]);


  const value = { feeds, addFeed, removeFeed, articles, isLoading, initialLoad, lastUpdated, refreshFeeds, fetchSocialData };

  return React.createElement(FeedContext.Provider, { value }, children);
};

export const useFeedManager = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeedManager must be used within a FeedProvider');
  }
  return context;
};