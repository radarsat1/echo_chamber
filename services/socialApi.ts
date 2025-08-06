
import { Comment, SocialData } from '../types';

const HN_SEARCH_API = 'https://hn.algolia.com/api/v1/search?query=';
const HN_ITEM_API = 'https://hn.algolia.com/api/v1/items/';
const REDDIT_SEARCH_API = 'https://www.reddit.com/search.json?q=';

const fetchHnData = async (url: string): Promise<Partial<SocialData['hn']>> => {
  try {
    const searchRes = await fetch(`${HN_SEARCH_API}${encodeURIComponent(url)}&tags=story`);
    if (!searchRes.ok) throw new Error(`HN search failed with status ${searchRes.status}`);
    const searchData = await searchRes.json();
    
    if (searchData.hits.length === 0) {
      return { id: null, url: null, comments: [], commentCount: 0, error: 'Not found on HN' };
    }

    const story = searchData.hits[0];
    const storyId = story.objectID;
    const commentCount = story.num_comments || 0;

    if (commentCount === 0) {
        return {
            id: storyId,
            url: `https://news.ycombinator.com/item?id=${storyId}`,
            comments: [],
            commentCount: 0
        };
    }
    
    const itemRes = await fetch(`${HN_ITEM_API}${storyId}`);
    if (!itemRes.ok) throw new Error(`HN item fetch failed with status ${itemRes.status}`);
    const itemData = await itemRes.json();
    
    const comments: Comment[] = (itemData.children || [])
      .filter((c: any) => c.text)
      .map((c: any) => ({
        id: `hn-${c.id}`,
        author: c.author || 'unknown',
        body: c.text,
        url: `https://news.ycombinator.com/item?id=${c.id}`,
      }));

    return {
      id: storyId,
      url: `https://news.ycombinator.com/item?id=${storyId}`,
      comments,
      commentCount,
    };
  } catch (error) {
    console.error('HN fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, comments: [], commentCount: 0 };
  }
};

const fetchRedditData = async (url: string): Promise<Partial<SocialData['reddit']>> => {
  try {
    // Use the search API which is more reliable for CORS
    const searchRes = await fetch(`${REDDIT_SEARCH_API}url:"${encodeURIComponent(url)}"`);
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

    const commentsRes = await fetch(`${submissionUrl}.json`);
    if(!commentsRes.ok) throw new Error(`Reddit comments fetch failed with status ${commentsRes.status}`);
    const commentsData = await commentsRes.json();
    
    const commentList = commentsData[1]?.data?.children || [];
    
    const comments: Comment[] = commentList
      .filter((c: any) => c.kind === 't1' && c.data.body)
      .map((c: any) => ({
        id: `reddit-${c.data.id}`,
        author: c.data.author,
        body: c.data.body_html,
        url: `https://www.reddit.com${c.data.permalink}`,
      }));

    return {
      url: submissionUrl,
      comments,
      commentCount,
    };
  } catch (error) {
    console.error('Reddit fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, comments: [], commentCount: 0 };
  }
};


export const fetchSocialDataForArticle = async (url: string): Promise<SocialData> => {
  const [hnResult, redditResult] = await Promise.all([
    fetchHnData(url),
    fetchRedditData(url)
  ]);
  
  return {
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