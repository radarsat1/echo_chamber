import { describe, it, expect, vi } from 'vitest';
import { parseRssFeed } from './rssParser';

const simonWillisonAtomFeed = `
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Simon Willison's Blog</title>
  <link href="https://simonwillison.net/" rel="alternate"/>
  <entry>
    <title>A new way of thinking about AI assistants</title>
    <link href="https://simonwillison.net/2024/May/25/thinking-about-ai-assistants/" rel="alternate"/>
    <id>tag:simonwillison.net,2024-05-25:/2024/May/25/thinking-about-ai-assistants/</id>
    <updated>2024-05-25T14:48:35-07:00</updated>
    <content type="html"><![CDATA[<p>Some content here</p>]]></content>
  </entry>
</feed>
`;

const hackerNewsRssFeed = `
<rss version="2.0">
  <channel>
    <title>Hacker News</title>
    <link>https://news.ycombinator.com/</link>
    <description>Links for the intellectually curious, ranked by readers.</description>
    <item>
      <title>Show HN: My new project</title>
      <link>https://example.com/project</link>
      <pubDate>Sun, 26 May 2024 12:00:00 GMT</pubDate>
      <description><![CDATA[Some description here.]]></description>
    </item>
  </channel>
</rss>
`;

describe('parseRssFeed', () => {
    it('should parse an Atom feed correctly', () => {
        const feed = { name: "Simon Willison's Blog", url: "https://simonwillison.net/atom/everything/" };
        const articles = parseRssFeed(simonWillisonAtomFeed, feed);
        expect(articles).toHaveLength(1);
        const article = articles[0];
        expect(article.title).toBe('A new way of thinking about AI assistants');
        expect(article.link).toBe('https://simonwillison.net/2024/May/25/thinking-about-ai-assistants/');
        expect(article.pubDate).toBe('2024-05-25T14:48:35-07:00');
        expect(article.description).toContain('Some content here...');
        expect(article.feedName).toBe(feed.name);
    });

    it('should parse a standard RSS 2.0 feed correctly', () => {
        const feed = { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' };
        const articles = parseRssFeed(hackerNewsRssFeed, feed);
        expect(articles).toHaveLength(1);
        const article = articles[0];
        expect(article.title).toBe('Show HN: My new project');
        expect(article.link).toBe('https://example.com/project');
        expect(article.pubDate).toBe('Sun, 26 May 2024 12:00:00 GMT');
        expect(article.description).toContain('Some description here....');
        expect(article.feedName).toBe(feed.name);
    });

    it('should handle parsing errors gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const feed = { name: 'Invalid Feed', url: 'invalid' };
        const invalidXml = '<rss><channel>broken';
        expect(() => parseRssFeed(invalidXml, feed)).toThrow('Failed to parse RSS feed.');
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    it('should filter out items without a title or link', () => {
        const incompleteFeed = `
        <rss version="2.0"><channel>
            <item><title>Good</title><link>https://good.com</link></item>
            <item><title>No Link</title></item>
            <item><link>https://no-title.com</link></item>
        </channel></rss>`;
        const feed = { name: 'Incomplete', url: 'incomplete' };
        const articles = parseRssFeed(incompleteFeed, feed);
        expect(articles).toHaveLength(1);
        expect(articles[0].title).toBe('Good');
    });
});