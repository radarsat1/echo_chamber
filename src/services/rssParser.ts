import { Article, Feed } from '../types';

// Simple hashing function for creating unique IDs
const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

const getElementText = (element: Element, tagName: string): string => {
  const node = element.querySelector(tagName);
  return node?.textContent?.trim() || '';
};

export const parseRssFeed = (xmlString: string, feed: Feed): Article[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml"); // Corrected MIME type for jsdom compatibility
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
      console.error("Error parsing XML:", errorNode.textContent);
      throw new Error("Failed to parse RSS feed.");
  }
  
  const items = Array.from(doc.querySelectorAll("item, entry"));
  
  return items.map(item => {
    const title = getElementText(item, "title");
    
    // Prioritize specific link elements for Atom feeds
    const atomLink = item.querySelector('link[rel="alternate"]');
    const link = atomLink?.getAttribute('href') || item.querySelector("link")?.getAttribute("href") || getElementText(item, "link");

    let description = getElementText(item, "description") || getElementText(item, "summary") || getElementText(item, "content");
    
    // Clean up description HTML
    const descDoc = parser.parseFromString(`<div>${description}</div>`, "text/html");
    description = (descDoc.body.textContent || "").trim().substring(0, 300) + '...';

    const pubDate = getElementText(item, "pubDate") || getElementText(item, "published") || getElementText(item, "updated") || new Date().toISOString();

    return {
      id: stringToHash(link),
      title,
      link,
      description,
      pubDate,
      feedName: feed.name,
      feedUrl: feed.url,
      social: {
        isFetching: false,
        lastSocialCheck: null,
        hn: { id: null, url: null, comments: [], commentCount: 0 },
        reddit: { url: null, comments: [], commentCount: 0 },
      },
    };
  }).filter(article => article.title && article.link);
};
