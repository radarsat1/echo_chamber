import { Article, Comment, SocialData } from '../types';
import { CORS_PROXY_URL } from '../constants';

const HN_SEARCH_API = 'https://hn.algolia.com/api/v1/search?query=';
const HN_ITEM_API = 'https://hn.algolia.com/api/v1/items/';
const REDDIT_SEARCH_API = 'https://www.reddit.com/search.json?q=';

const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const parseHnComments = (comments: any[], depth: number): Comment[] => {
    if (!comments) return [];
    return comments
        .filter(c => c && c.text)
        .map(c => ({
            id: `hn-${c.id}`,
            author: c.author || '[deleted]',
            body: c.text,
            url: `https://news.ycombinator.com/item?id=${c.id}`,
            depth: depth,
            children: parseHnComments(c.children || [], depth + 1)
        }));
};

const fetchHnData = async (article: Article): Promise<Partial<SocialData['hn']>> => {
  try {
    const searchUrl = `${HN_SEARCH_API}${encodeURIComponent(article.title)}&tags=story`;
    const searchRes = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(searchUrl)}`);
    if (!searchRes.ok) throw new Error(`HN search failed with status ${searchRes.status}`);
    const searchData = await searchRes.json();
    
    if (searchData.hits.length === 0) {
      return { id: null, url: null, comments: [], commentCount: 0, error: 'Not found on HN' };
    }

    const story = searchData.hits[0];
    const storyId = story.objectID;
    const commentCount = story.num_comments || 0;

    if (commentCount === 0) {
        return { id: storyId, url: `https://news.ycombinator.com/item?id=${storyId}`, comments: [], commentCount: 0 };
    }
    
    const itemUrl = `${HN_ITEM_API}${storyId}`;
    const itemRes = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(itemUrl)}`);
    if (!itemRes.ok) throw new Error(`HN item fetch failed with status ${itemRes.status}`);
    const itemData = await itemRes.json();
    
    const comments = parseHnComments(itemData.children || [], 0);

    return { id: storyId, url: `https://news.ycombinator.com/item?id=${storyId}`, comments, commentCount };
  } catch (error) {
    console.error('HN fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, comments: [], commentCount: 0 };
  }
};

const parseRedditComments = (commentItems: any[], depth: number): Comment[] => {
    if (!commentItems) return [];
    return commentItems
        .filter(c => c.kind === 't1' && c.data.body)
        .map(c => {
            const commentData = c.data;
            const replies = commentData.replies?.data?.children || [];
            return {
                id: `reddit-${commentData.id}`,
                author: commentData.author,
                body: decodeHtmlEntities(commentData.body_html),
                url: `https://www.reddit.com${commentData.permalink}`,
                depth: depth,
                children: parseRedditComments(replies, depth + 1)
            };
        });
};

const fetchRedditData = async (article: Article): Promise<Partial<SocialData['reddit']>> => {
  try {
    const searchUrl = `${REDDIT_SEARCH_API}title:"${encodeURIComponent(article.title)}"`;
    const searchRes = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(searchUrl)}`);
    if (!searchRes.ok) throw new Error(`Reddit search failed with status ${searchRes.status}`);
    const searchData = await searchRes.json();

    if (!searchData?.data?.children?.length) {
       return { url: null, comments: [], commentCount: 0, error: 'Not found on Reddit' };
    }
    
    const post = searchData.data.children[0].data;
    const submissionPermalink = post.permalink;
    const submissionUrl = `https://www.reddit.com${submissionPermalink}`;
    const commentCount = post.num_comments || 0;
    
    if (commentCount === 0) {
      return { url: submissionUrl, comments: [], commentCount: 0 };
    }

    const commentsUrl = `${submissionUrl}.json?limit=100`; // Fetch more comments
    const commentsRes = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(commentsUrl)}`);
    if(!commentsRes.ok) throw new Error(`Reddit comments fetch failed with status ${commentsRes.status}`);
    const commentsData = await commentsRes.json();
    
    const topLevelComments = commentsData[1]?.data?.children || [];
    const comments = parseRedditComments(topLevelComments, 0);

    return { url: submissionUrl, comments, commentCount };
  } catch (error) {
    console.error('Reddit fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, comments: [], commentCount: 0 };
  }
};


export const fetchSocialDataForArticle = async (article: Article): Promise<SocialData> => {
  const [hnResult, redditResult] = await Promise.all([
    fetchHnData(article),
    fetchRedditData(article)
  ]);
  
  return {
    lastSocialCheck: Date.now(),
    hn: {
      id: hnResult.id || null,
      url: hnResult.url || null,
      comments: hnResult.comments || [],
      commentCount: hnResult.commentCount || 0,
      error: hnResult.error
    },
    reddit: {
      url: redditResult.url || null,
      comments: redditResult.comments || [],
      commentCount: redditResult.commentCount || 0,
      error: redditResult.error
    }
  };
};
