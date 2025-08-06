
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  importFeeds: (feedsToImport: Feed[]) => void;
  articles: Article[];
  isLoading: boolean;
  initialLoad: boolean;
  lastUpdated: number | null;
  refreshFeeds: (force?: boolean) => void;
  fetchSocialData: (articleId: string, force?: boolean) => void;
  showEmpty: boolean;
  toggleShowEmpty: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const SOCIAL_CHECK_INTERVAL = 3 * 1000; // 3 seconds
const SOCIAL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for no-comment articles

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useLocalStorage<Feed[]>('rss_feeds', DEFAULT_FEEDS);
  const [articles, setArticles] = useLocalStorage<Article[]>('rss_articles', []);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useLocalStorage<number | null>('rss_last_updated', null);
  const [showEmpty, setShowEmpty] = useState(true);

  const socialCheckQueue = useRef<string[]>([]);
  const isCheckingSocial = useRef(false);

  const toggleShowEmpty = () => setShowEmpty(prev => !prev);

  const addFeed = (feed: Feed) => {
    if (!feeds.some(f => f.url === feed.url)) {
      setFeeds(prevFeeds => [...prevFeeds, feed]);
    }
  };

  const removeFeed = (url: string) => {
    setFeeds(prevFeeds => prevFeeds.filter(f => f.url !== url));
    setArticles(prevArticles => prevArticles.filter(a => a.feedUrl !== url));
  };
  
  const importFeeds = (feedsToImport: Feed[]) => {
    setFeeds(currentFeeds => {
      const feedMap = new Map(currentFeeds.map(f => [f.url, f]));
      feedsToImport.forEach(newFeed => {
        if (newFeed.url && newFeed.name) { // Basic validation
          feedMap.set(newFeed.url, newFeed);
        }
      });
      return Array.from(feedMap.values());
    });
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
            return [];
          })
      );
      
      const newArticlesArrays = await Promise.all(feedPromises);
      const limitedArticlesArrays = newArticlesArrays.map(arr => arr.slice(0, 20));
      const newArticles = limitedArticlesArrays.flat();
      
      setArticles(prevArticles => {
        const articleMap = new Map(prevArticles.map(a => [a.id, a]));
        newArticles.forEach(a => {
          if (!articleMap.has(a.id)) {
            articleMap.set(a.id, a);
          }
        });
        return Array.from(articleMap.values());
      });
      
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to refresh feeds:", error);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [feeds, isLoading, lastUpdated, setArticles, setLastUpdated]);

  const fetchSocialData = useCallback(async (articleId: string, force = false) => {
    const article = articles.find(a => a.id === articleId);

    if (!article || article.social.isFetching) return;
    
    const hasComments = article.social.hn.commentCount > 0 || article.social.reddit.commentCount > 0;
    const recentlyChecked = article.social.lastSocialCheck && (Date.now() - article.social.lastSocialCheck < SOCIAL_CACHE_DURATION);

    if (!force && hasComments) return;
    if (!force && !hasComments && recentlyChecked) return;

    setArticles(produce(draft => {
      const articleToUpdate = draft.find(a => a.id === articleId);
      if (articleToUpdate) articleToUpdate.social.isFetching = true;
    }));

    try {
      const socialData = await fetchSocialDataForArticle(article);
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
        if (articleToUpdate) articleToUpdate.social.isFetching = false;
      }));
    }
  }, [articles, setArticles]);

  // Effect to populate the social check queue
  useEffect(() => {
    socialCheckQueue.current = articles
      .filter(a => {
        const hasComments = a.social.hn.commentCount > 0 || a.social.reddit.commentCount > 0;
        const recentlyChecked = a.social.lastSocialCheck && (Date.now() - a.social.lastSocialCheck < SOCIAL_CACHE_DURATION);
        return !hasComments && !recentlyChecked;
      })
      .map(a => a.id);
  }, [articles, lastUpdated]);

  // Effect to process the social check queue
  useEffect(() => {
    const processQueue = async () => {
      if (isCheckingSocial.current || socialCheckQueue.current.length === 0) {
        return;
      }
      isCheckingSocial.current = true;
      const articleId = socialCheckQueue.current.shift();
      
      if (articleId) {
        await fetchSocialData(articleId, false);
      }
      
      isCheckingSocial.current = false;
    };
    
    const intervalId = setInterval(processQueue, SOCIAL_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchSocialData]);


  useEffect(() => {
    refreshFeeds();
    const interval = setInterval(() => refreshFeeds(), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [feeds, refreshFeeds]);


  const value = { feeds, addFeed, removeFeed, importFeeds, articles, isLoading, initialLoad, lastUpdated, refreshFeeds, fetchSocialData, showEmpty, toggleShowEmpty };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeedManager = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeedManager must be used within a FeedProvider');
  }
  return context;
};
