import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { KnowledgeBase } from './base';
import { BlogConfig, PortfolioDocument } from './types';

export class BlogKnowledge extends KnowledgeBase {
  private blogConfig: BlogConfig;
  private parser: Parser;

  constructor(base: KnowledgeBase, blogConfig: BlogConfig) {
    super(base);
    this.blogConfig = blogConfig;
    this.parser = new Parser();
  }

  async refresh() {
    await this.clearSource('blog');
    const documents = await this.fetchBlogPosts();
    await this.addDocuments(documents);
  }

  private async fetchBlogPosts(): Promise<PortfolioDocument[]> {
    const documents: PortfolioDocument[] = [];

    // Fetch from RSS if configured
    if (this.blogConfig.rssUrl) {
      const feed = await this.parser.parseURL(this.blogConfig.rssUrl);
      for (const item of feed.items) {
        const content = await this.extractContent(item.link || '');
        documents.push({
          pageContent: `Title: ${item.title}\n\n${content}`,
          metadata: {
            source: 'blog',
            type: 'post',
            url: item.link,
            title: item.title,
            date: item.pubDate,
            tags: item.categories,
          },
        });
      }
    }

    // Fetch from Medium if configured
    if (this.blogConfig.mediumUsername) {
      const mediumFeed = await this.parser.parseURL(
        `https://medium.com/feed/@${this.blogConfig.mediumUsername}`
      );
      for (const item of mediumFeed.items) {
        documents.push({
          pageContent: `Title: ${item.title}\n\n${item['content:encoded'] || item.content}`,
          metadata: {
            source: 'blog',
            type: 'medium',
            url: item.link,
            title: item.title,
            date: item.pubDate,
            tags: item.categories,
          },
        });
      }
    }

    // Fetch from Dev.to if configured
    if (this.blogConfig.devToUsername) {
      const devToFeed = await this.parser.parseURL(
        `https://dev.to/feed/${this.blogConfig.devToUsername}`
      );
      for (const item of devToFeed.items) {
        documents.push({
          pageContent: `Title: ${item.title}\n\n${item.content}`,
          metadata: {
            source: 'blog',
            type: 'devto',
            url: item.link,
            title: item.title,
            date: item.pubDate,
            tags: item.categories,
          },
        });
      }
    }

    return documents;
  }

  private async extractContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const article = dom.window.document.querySelector('article');
      return article ? article.textContent || '' : '';
    } catch (error) {
      console.warn(`Failed to extract content from ${url}:`, error);
      return '';
    }
  }
} 